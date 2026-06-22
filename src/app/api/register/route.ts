import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import emailjs from "@emailjs/nodejs";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per file, enforced on upload
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

// EmailJS (and most email providers) get unreliable above ~10MB per message,
// once base64 encoding overhead is included. We cap total attached bytes we
// actually email, while still accepting and *storing* every valid upload above.
const MAX_TOTAL_EMAIL_ATTACHMENT_BYTES = 9 * 1024 * 1024; // 9MB raw budget

const REGISTRATION_FEE = 100;
const FIRST_MONTH_TUITION = 350;
const MONTHLY_TUITION = 350;

// Always-required documents
const REQUIRED_DOCUMENT_FIELDS = ["nibCard", "healthCertificate", "birthCertificate", "parentId"];
// Optional regardless of other answers
const OPTIONAL_DOCUMENT_FIELDS = ["reportCard", "proofOfInsurance"];

const FIELD_LABELS: Record<string, string> = {
  nibCard: "NIB Card",
  healthCertificate: "Health Certificate",
  birthCertificate: "Birth Certificate",
  parentId: "Parent / Guardian ID",
  reportCard: "Report Card",
  proofOfInsurance: "Proof of Insurance",
};

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // --- Extract & validate basic text fields ---
    const required = [
      "childFirstName",
      "childLastName",
      "childDob",
      "program",
      "uniformSize",
      "parentName",
      "parentEmail",
      "parentPhone",
      "paymentMethod",
    ];

    const values: Record<string, string> = {};
    for (const key of required) {
      const v = formData.get(key);
      if (!v || typeof v !== "string" || v.trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${key}` },
          { status: 400 }
        );
      }
      values[key] = v.trim();
    }

    const agreedToPolicy = formData.get("agreedToPolicy");
    if (agreedToPolicy !== "true") {
      return NextResponse.json(
        { error: "You must agree to the school policy before submitting." },
        { status: 400 }
      );
    }
    values.agreedToPolicy = "true";

    const emergencyContact = formData.get("emergencyContact");
    const notes = formData.get("notes");

    // --- Validate & save document uploads ---
    const submissionId = randomUUID();
    const uploadDir = path.join("/home/claude/elpai/uploads", submissionId);

    const savedFiles: Record<string, string> = {};
    // Keep buffers in memory only long enough to build email attachments below.
    const fileBuffers: { field: string; fileName: string; mimeType: string; buffer: Buffer }[] = [];

    const documentFields = [
      ...REQUIRED_DOCUMENT_FIELDS.map((f) => ({ field: f, required: true })),
      ...OPTIONAL_DOCUMENT_FIELDS.map((f) => ({ field: f, required: false })),
    ];

    for (const { field, required: isRequired } of documentFields) {
      const file = formData.get(field) as File | null;

      if (!file || typeof file === "string" || file.size === 0) {
        if (isRequired) {
          return NextResponse.json(
            { error: `Missing required document: ${field}` },
            { status: 400 }
          );
        }
        continue;
      }

      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: `${field} is too large. Max size is 8MB.` },
          { status: 400 }
        );
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `${field} must be a JPG, PNG, HEIC, or PDF file.` },
          { status: 400 }
        );
      }

      await mkdir(uploadDir, { recursive: true });
      const ext = file.name.split(".").pop() || "bin";
      const safeName = `${field}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, safeName), buffer);
      savedFiles[field] = safeName;
      fileBuffers.push({ field, fileName: safeName, mimeType: file.type, buffer });
    }

    // --- Compute fees server-side (source of truth, never trust client math) ---
    const firstMonthTotal = REGISTRATION_FEE + FIRST_MONTH_TUITION;

    // --- Persist a record of the submission (always happens, regardless of email outcome) ---
    const record = {
      submissionId,
      submittedAt: new Date().toISOString(),
      schoolStartDate: "2026-09-07",
      ...values,
      emergencyContact: typeof emergencyContact === "string" ? emergencyContact : "",
      notes: typeof notes === "string" ? notes : "",
      files: savedFiles,
      fees: {
        registrationFee: REGISTRATION_FEE,
        firstMonthTuition: FIRST_MONTH_TUITION,
        firstMonthTotal,
        monthlyTuitionAfter: MONTHLY_TUITION,
      },
    };

    await mkdir("/home/claude/elpai/uploads", { recursive: true });
    await writeFile(
      path.join(uploadDir, "submission.json"),
      JSON.stringify(record, null, 2)
    );

    // --- Email the school via EmailJS (best-effort: a failure here never fails the registration) ---
    let emailSent = false;
    let emailError: string | null = null;

    try {
      emailSent = await sendRegistrationEmail(record, fileBuffers);
    } catch (err) {
      emailError = extractEmailJsErrorMessage(err);
      console.error("EmailJS send failed:", err);
    }

    return NextResponse.json({
      success: true,
      submissionId,
      fees: record.fees,
      emailSent,
      emailError,
    });
  } catch (err) {
    console.error("Registration submission failed:", err);
    return NextResponse.json(
      { error: "Something went wrong submitting your registration. Please try again." },
      { status: 500 }
    );
  }
}

function extractEmailJsErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "text" in err) {
    const text = (err as { text?: unknown }).text;
    const status = (err as { status?: unknown }).status;
    if (typeof text === "string") {
      return status ? `EmailJS error ${status}: ${text}` : text;
    }
  }
  return err instanceof Error ? err.message : "Unknown email error";
}

async function sendRegistrationEmail(
  record: Record<string, unknown>,
  fileBuffers: { field: string; fileName: string; mimeType: string; buffer: Buffer }[]
): Promise<boolean> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const toEmail = process.env.EMAILJS_TO_EMAIL;

  if (!serviceId || !templateId || !toEmail) {
    console.warn("EmailJS env vars missing — skipping email send. Submission was still saved to disk.");
    return false;
  }

  // Stay under the total attachment budget: include files in priority order
  // (required documents first) until we'd exceed the budget, and note any
  // that were left out so the school knows to check the saved-files folder.
  let runningBytes = 0;
  const includedAttachments: { name: string; data: string }[] = [];
  const omittedFileNames: string[] = [];

  for (const f of fileBuffers) {
    if (runningBytes + f.buffer.length > MAX_TOTAL_EMAIL_ATTACHMENT_BYTES) {
      omittedFileNames.push(`${FIELD_LABELS[f.field] ?? f.field} (${f.fileName})`);
      continue;
    }
    runningBytes += f.buffer.length;
    const base64 = f.buffer.toString("base64");
    includedAttachments.push({
      name: `attachment_${f.field}`,
      data: `data:${f.mimeType};base64,${base64}`,
    });
  }

  const templateParams: Record<string, unknown> = {
    to_email: toEmail,
    submission_id: record.submissionId,
    submitted_at: record.submittedAt,
    school_start_date: record.schoolStartDate,
    child_name: `${record.childFirstName} ${record.childLastName}`,
    child_dob: record.childDob,
    program: record.program,
    uniform_size: record.uniformSize,
    parent_name: record.parentName,
    parent_email: record.parentEmail,
    parent_phone: record.parentPhone,
    emergency_contact: record.emergencyContact || "—",
    notes: record.notes || "—",
    payment_method: record.paymentMethod,
    policy_agreed: "Yes",
    first_month_total: (record.fees as { firstMonthTotal: number }).firstMonthTotal,
    monthly_tuition_after: (record.fees as { monthlyTuitionAfter: number }).monthlyTuitionAfter,
    documents_included: includedAttachments.map((a) => a.name).join(", ") || "none",
    documents_omitted:
      omittedFileNames.length > 0
        ? `${omittedFileNames.join(", ")} — too large to email, saved on server only`
        : "none",
  };

  // Attach each file as its own variable attachment param, matching the
  // parameter names configured in the EmailJS template's Attachments tab.
  for (const att of includedAttachments) {
    templateParams[att.name] = att.data;
  }

  await emailjs.send(serviceId, templateId, templateParams);
  return true;
}