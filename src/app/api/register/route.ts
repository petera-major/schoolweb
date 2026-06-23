import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import emailjs from "@emailjs/nodejs";
import { supabaseAdmin, REGISTRATIONS_BUCKET } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per file, enforced on upload
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

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

// EmailJS init is wrapped: if keys are missing or malformed, we log a clear
// warning instead of crashing the entire route at module load time. Without
// this, every registration submission would fail with a 500 the moment
// EMAILJS_PUBLIC_KEY / EMAILJS_PRIVATE_KEY are unset, even though email is
// meant to be a best-effort extra, not a requirement for registering.
try {
  if (process.env.EMAILJS_PUBLIC_KEY && process.env.EMAILJS_PRIVATE_KEY) {
    emailjs.init({
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    });
  } else {
    console.warn(
      "EmailJS not initialized — EMAILJS_PUBLIC_KEY and/or EMAILJS_PRIVATE_KEY are missing from environment variables. Registrations will still save, but no email will be sent until these are set in .env.local (and the dev server restarted)."
    );
  }
} catch (err) {
  console.error("EmailJS initialization failed:", err);
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            "Registration storage isn't configured yet. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local and restart the server.",
        },
        { status: 500 }
      );
    }

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

    // --- Validate & upload documents to Supabase Storage ---
    const submissionId = randomUUID();

    // Stores field -> storage path, so the admin dashboard can generate
    // signed (temporary, private) download links later.
    const storedFiles: Record<string, string> = {};
    const uploadedLabels: string[] = [];

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

      const ext = file.name.split(".").pop() || "bin";
      const storagePath = `${submissionId}/${field}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabaseAdmin.storage
        .from(REGISTRATIONS_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(`Supabase upload failed for ${field}:`, uploadError);
        return NextResponse.json(
          { error: "Something went wrong uploading your documents. Please try again." },
          { status: 500 }
        );
      }

      storedFiles[field] = storagePath;
      uploadedLabels.push(FIELD_LABELS[field] ?? field);
    }

    // --- Compute fees server-side (source of truth, never trust client math) ---
    const firstMonthTotal = REGISTRATION_FEE + FIRST_MONTH_TUITION;
    const schoolStartDate = "2026-09-07";
    const submittedAt = new Date().toISOString();

    // --- Persist the registration record in the database (always happens,
    // regardless of email outcome — this is now the source of truth, not
    // local disk, since local disk doesn't survive a deploy). ---
    const { error: dbError } = await supabaseAdmin.from("registrations").insert({
      id: submissionId,
      submitted_at: submittedAt,
      school_start_date: schoolStartDate,
      child_first_name: values.childFirstName,
      child_last_name: values.childLastName,
      child_dob: values.childDob,
      program: values.program,
      uniform_size: values.uniformSize,
      parent_name: values.parentName,
      parent_email: values.parentEmail,
      parent_phone: values.parentPhone,
      emergency_contact: typeof emergencyContact === "string" ? emergencyContact : "",
      notes: typeof notes === "string" ? notes : "",
      payment_method: values.paymentMethod,
      agreed_to_policy: true,
      registration_fee: REGISTRATION_FEE,
      first_month_tuition: FIRST_MONTH_TUITION,
      first_month_total: firstMonthTotal,
      monthly_tuition_after: MONTHLY_TUITION,
      files: storedFiles,
    });

    if (dbError) {
      console.error("Supabase database insert failed:", dbError);
      return NextResponse.json(
        { error: "Something went wrong saving your registration. Please try again." },
        { status: 500 }
      );
    }

    // --- Email the school a NOTIFICATION ONLY (no attachments — documents
    // now live in the admin dashboard instead, avoiding EmailJS's small
    // attachment size limits entirely). A failure here never fails the
    // registration itself; it's always already saved by this point. ---
    let emailSent = false;
    let emailError: string | null = null;

    try {
      emailSent = await sendRegistrationNotification({
        submissionId,
        submittedAt,
        schoolStartDate,
        childName: `${values.childFirstName} ${values.childLastName}`,
        childDob: values.childDob,
        program: values.program,
        uniformSize: values.uniformSize,
        parentName: values.parentName,
        parentEmail: values.parentEmail,
        parentPhone: values.parentPhone,
        emergencyContact: typeof emergencyContact === "string" ? emergencyContact : "",
        notes: typeof notes === "string" ? notes : "",
        paymentMethod: values.paymentMethod,
        firstMonthTotal,
        monthlyTuitionAfter: MONTHLY_TUITION,
        documentsUploaded: uploadedLabels,
      });
    } catch (err) {
      emailError = extractEmailJsErrorMessage(err);
      console.error("EmailJS send failed:", err);
    }

    return NextResponse.json({
      success: true,
      submissionId,
      fees: {
        registrationFee: REGISTRATION_FEE,
        firstMonthTuition: FIRST_MONTH_TUITION,
        firstMonthTotal,
        monthlyTuitionAfter: MONTHLY_TUITION,
      },
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

async function sendRegistrationNotification(data: {
  submissionId: string;
  submittedAt: string;
  schoolStartDate: string;
  childName: string;
  childDob: string;
  program: string;
  uniformSize: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact: string;
  notes: string;
  paymentMethod: string;
  firstMonthTotal: number;
  monthlyTuitionAfter: number;
  documentsUploaded: string[];
}): Promise<boolean> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const toEmail = process.env.EMAILJS_TO_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  if (!serviceId || !templateId || !toEmail) {
    console.warn("EmailJS env vars missing — skipping email send. Registration was still saved.");
    return false;
  }

  const templateParams = {
    to_email: toEmail,
    submission_id: data.submissionId,
    submitted_at: data.submittedAt,
    school_start_date: data.schoolStartDate,
    child_name: data.childName,
    child_dob: data.childDob,
    program: data.program,
    uniform_size: data.uniformSize,
    parent_name: data.parentName,
    parent_email: data.parentEmail,
    parent_phone: data.parentPhone,
    emergency_contact: data.emergencyContact || "—",
    notes: data.notes || "",
    payment_method: data.paymentMethod,
    policy_agreed: "Yes",
    first_month_total: data.firstMonthTotal,
    monthly_tuition_after: data.monthlyTuitionAfter,
    documents_uploaded: data.documentsUploaded.join(", ") || "none",
    admin_link: siteUrl ? `${siteUrl}/admin` : "(set NEXT_PUBLIC_SITE_URL to enable this link)",
  };

  await emailjs.send(serviceId, templateId, templateParams);
  return true;
}