"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Banknote,
  Loader2,
  ScrollText,
} from "lucide-react";
import { SunDoodle, StarDoodle, HeartDoodle } from "@/components/Doodles";
import FileUploadField from "@/components/FileUploadField";

const STEPS = ["Child & Program", "Parent Info", "Documents", "Policy", "Payment & Review"];

const PROGRAMS = [
  { value: "prek3", label: "PreK3 (3 – 4 years)" },
  { value: "prek4", label: "PreK4 (4 – 5 years)" },
  { value: "kindergarten", label: "Kindergarten (5 – 6 years)" },
  { value: "grade1", label: "Grade 1 Aftercare (6 – 8 years)" },
];

const UNIFORM_SIZES = ["3T–4T", "4T–5T", "5T–6T", "6x–7", "7–8", "9–10"];

const POLICIES = [
  "Fees are due by the end of each month for the following month.",
  "A $25 late fee applies to late payments and is non-negotiable.",
  "Withdrawing from the school requires a 30% return fee.",
  "Uniforms must be purchased from the school and display the school logo.",
  "Early drop-off (7:30 AM) must be arranged in advance with administration.",
  "Proof of insurance is mandatory for every enrolled student.",
  "Children with a contagious illness or symptoms must stay home.",
];

type FormState = {
  childFirstName: string;
  childLastName: string;
  childDob: string;
  program: string;
  uniformSize: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact: string;
  notes: string;
  agreedToPolicy: boolean;
  paymentMethod: "online" | "in_person" | "";
};

const INITIAL_STATE: FormState = {
  childFirstName: "",
  childLastName: "",
  childDob: "",
  program: "",
  uniformSize: "",
  parentName: "",
  parentEmail: "",
  parentPhone: "",
  emergencyContact: "",
  notes: "",
  agreedToPolicy: false,
  paymentMethod: "",
};

const REGISTRATION_FEE = 100;
const FIRST_MONTH_TUITION = 350;
const MONTHLY_TUITION_AFTER = 350;

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const firstMonthTotal = REGISTRATION_FEE + FIRST_MONTH_TUITION;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function stepIsValid(): boolean {
    if (step === 0) {
      return !!(form.childFirstName && form.childLastName && form.childDob && form.program && form.uniformSize);
    }
    if (step === 1) {
      return !!(form.parentName && form.parentEmail && form.parentPhone);
    }
    if (step === 2) {
      return !!(
        files.nibCard &&
        files.healthCertificate &&
        files.birthCertificate &&
        files.parentId
      );
    }
    if (step === 3) {
      return form.agreedToPolicy;
    }
    if (step === 4) {
      return !!form.paymentMethod;
    }
    return true;
  }

  function goNext() {
    if (!stepIsValid()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!stepIsValid()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
      Object.entries(files).forEach(([k, file]) => {
        if (file) data.append(k, file);
      });

      const res = await fetch("/api/register", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Submission failed. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-5 relative overflow-hidden">
        <StarDoodle className="hidden sm:block absolute top-10 left-10 w-10 h-10" />
        <HeartDoodle className="hidden sm:block absolute bottom-10 right-10 w-14 h-14" />
        <div className="bg-white wobble crayon-shadow p-10 sm:p-12 max-w-lg text-center relative z-10">
          <CheckCircle2 className="w-16 h-16 text-[var(--sky-dark)] mx-auto mb-5" />
          <h1 className="font-display text-3xl font-semibold mb-3">
            You&apos;re all set!
          </h1>
          <p className="opacity-75 leading-relaxed mb-2">
            Thank you for registering {form.childFirstName} with Effective
            Learning Preschool &amp; Aftercare Institute.
          </p>
          <p className="opacity-75 leading-relaxed mb-2">
            {form.paymentMethod === "online"
              ? `We'll follow up by email with a secure link to pay your $${firstMonthTotal} first month fee.`
              : `Please bring $${firstMonthTotal} (cash or card) for your first month when you visit our office.`}
          </p>
          <p className="font-bold text-sm text-[var(--orange-dark)] mb-8">
            See you on the first day of school — September 7, 2026!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold px-7 py-3.5 rounded-full crayon-shadow transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      <SunDoodle className="hidden sm:block absolute top-6 left-6 w-14 h-14" />

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 sm:py-14 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold opacity-60 hover:opacity-100 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-2">
          Register Your Child
        </h1>
        <p className="opacity-70 mb-8">
          Effective Learning Preschool &amp; Aftercare Institute
        </p>

        {/* Progress tracker */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={`h-2.5 rounded-full transition-colors ${
                  i <= step ? "bg-[var(--orange)]" : "bg-[var(--ink)]/10"
                }`}
              />
              <p
                className={`text-[11px] mt-1.5 font-bold text-center leading-tight ${
                  i === step ? "text-[var(--orange-dark)]" : "opacity-40"
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white wobble crayon-shadow p-6 sm:p-9">
          {/* STEP 0: Child & Program */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-semibold mb-1">
                Tell us about your child
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm mb-1.5 block">
                    Child&apos;s First Name <span className="text-[var(--orange-dark)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.childFirstName}
                    onChange={(e) => update("childFirstName", e.target.value)}
                    className="w-full border-2 border-[var(--ink)]/15 rounded-xl px-4 py-3 focus:border-[var(--sky-dark)] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-sm mb-1.5 block">
                    Child&apos;s Last Name <span className="text-[var(--orange-dark)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.childLastName}
                    onChange={(e) => update("childLastName", e.target.value)}
                    className="w-full border-2 border-[var(--ink)]/15 rounded-xl px-4 py-3 focus:border-[var(--sky-dark)] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-sm mb-1.5 block">
                  Date of Birth <span className="text-[var(--orange-dark)]">*</span>
                </label>
                <input
                  type="date"
                  value={form.childDob}
                  onChange={(e) => update("childDob", e.target.value)}
                  className="w-full border-2 border-[var(--ink)]/15 rounded-xl px-4 py-3 focus:border-[var(--sky-dark)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-sm mb-1.5 block">
                  Program <span className="text-[var(--orange-dark)]">*</span>
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PROGRAMS.map((p) => (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => update("program", p.value)}
                      className={`text-left px-4 py-3 rounded-xl border-2 font-bold text-sm transition-colors ${
                        form.program === p.value
                          ? "border-[var(--orange)] bg-[var(--orange)]/10"
                          : "border-[var(--ink)]/15 hover:border-[var(--ink)]/30"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-sm mb-1.5 block">
                  Uniform Size <span className="text-[var(--orange-dark)]">*</span>
                  <span className="opacity-50 font-normal"> — included with registration</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {UNIFORM_SIZES.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => update("uniformSize", size)}
                      className={`px-3 py-3 rounded-xl border-2 font-display font-semibold text-sm transition-colors ${
                        form.uniformSize === size
                          ? "border-[var(--sky-dark)] bg-[var(--sky)]/20"
                          : "border-[var(--ink)]/15 hover:border-[var(--ink)]/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Parent Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-semibold mb-1">
                Parent / Guardian Information
              </h2>

              <div>
                <label className="font-bold text-sm mb-1.5 block">
                  Full Name <span className="text-[var(--orange-dark)]">*</span>
                </label>
                <input
                  type="text"
                  value={form.parentName}
                  onChange={(e) => update("parentName", e.target.value)}
                  className="w-full border-2 border-[var(--ink)]/15 rounded-xl px-4 py-3 focus:border-[var(--sky-dark)] outline-none"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm mb-1.5 block">
                    Email <span className="text-[var(--orange-dark)]">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.parentEmail}
                    onChange={(e) => update("parentEmail", e.target.value)}
                    className="w-full border-2 border-[var(--ink)]/15 rounded-xl px-4 py-3 focus:border-[var(--sky-dark)] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-sm mb-1.5 block">
                    Phone Number <span className="text-[var(--orange-dark)]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.parentPhone}
                    onChange={(e) => update("parentPhone", e.target.value)}
                    className="w-full border-2 border-[var(--ink)]/15 rounded-xl px-4 py-3 focus:border-[var(--sky-dark)] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-sm mb-1.5 block">
                  Emergency Contact <span className="text-[var(--orange-dark)]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Name and phone number"
                  value={form.emergencyContact}
                  onChange={(e) => update("emergencyContact", e.target.value)}
                  className="w-full border-2 border-[var(--ink)]/15 rounded-xl px-4 py-3 focus:border-[var(--sky-dark)] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-sm mb-1.5 block">
                  Anything else we should know? <span className="opacity-50 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Allergies, medical notes, special requests..."
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className="w-full border-2 border-[var(--ink)]/15 rounded-xl px-4 py-3 focus:border-[var(--sky-dark)] outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Documents */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-semibold mb-1">
                Upload Documents
              </h2>
              <p className="text-sm opacity-70 -mt-3 mb-4">
                Take a photo or upload a scan of each document. Accepted formats:
                JPG, PNG, HEIC, or PDF (max 8MB each).
              </p>

              <FileUploadField
                name="nibCard"
                label="NIB Card"
                required
                onFileChange={(f) => setFiles((prev) => ({ ...prev, nibCard: f }))}
              />
              <FileUploadField
                name="healthCertificate"
                label="Health Certificate"
                required
                onFileChange={(f) => setFiles((prev) => ({ ...prev, healthCertificate: f }))}
              />
              <FileUploadField
                name="birthCertificate"
                label="Birth Certificate"
                required
                onFileChange={(f) => setFiles((prev) => ({ ...prev, birthCertificate: f }))}
              />
              <FileUploadField
                name="parentId"
                label="Parent / Guardian Government ID"
                required
                onFileChange={(f) => setFiles((prev) => ({ ...prev, parentId: f }))}
              />
              <FileUploadField
                name="reportCard"
                label="Report Card from Previous School"
                onFileChange={(f) => setFiles((prev) => ({ ...prev, reportCard: f }))}
              />
              <div>
                <FileUploadField
                  name="proofOfInsurance"
                  label="Proof of Insurance"
                  onFileChange={(f) => setFiles((prev) => ({ ...prev, proofOfInsurance: f }))}
                />
                <p className="text-xs opacity-60 mt-1.5 leading-relaxed">
                  Don&apos;t have it? No problem — an insurance form will be
                  available at school on the first day for your child to sign up.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Policy */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-semibold mb-1 flex items-center gap-2">
                <ScrollText className="w-6 h-6 text-[var(--orange-dark)]" />
                School Policy
              </h2>
              <p className="text-sm opacity-70 -mt-3">
                Please read through our school policies before continuing.
              </p>

              <div className="bg-[var(--sky)]/15 wobble p-6 max-h-80 overflow-y-auto">
                <ul className="space-y-3">
                  {POLICIES.map((policy) => (
                    <li key={policy} className="flex gap-3 text-sm leading-relaxed">
                      <span className="text-[var(--orange-dark)] font-bold flex-shrink-0">•</span>
                      <span>{policy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex items-start gap-3 bg-white wobble crayon-shadow px-5 py-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreedToPolicy}
                  onChange={(e) => update("agreedToPolicy", e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-[var(--orange)] flex-shrink-0 cursor-pointer"
                />
                <span className="text-sm font-bold">
                  I have read and agree to the school policy above.{" "}
                  <span className="text-[var(--orange-dark)]">*</span>
                </span>
              </label>
            </div>
          )}

          {/* STEP 4: Payment & Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-semibold mb-1">
                Payment Method &amp; Review
              </h2>

              <div className="bg-[var(--pink)]/20 wobble p-5">
                <p className="font-bold text-sm mb-3">First Month Total: ${firstMonthTotal}</p>
                <ul className="text-sm opacity-75 space-y-1 leading-relaxed">
                  <li>• ${REGISTRATION_FEE} registration fee (includes uniform) — non-refundable</li>
                  <li>• ${FIRST_MONTH_TUITION} first month tuition</li>
                  <li>• ${MONTHLY_TUITION_AFTER}/month going forward</li>
                </ul>
              </div>

              <div>
                <label className="font-bold text-sm mb-2 block">
                  How would you like to pay? <span className="text-[var(--orange-dark)]">*</span>
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => update("paymentMethod", "online")}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 font-bold text-sm transition-colors ${
                      form.paymentMethod === "online"
                        ? "border-[var(--sky-dark)] bg-[var(--sky)]/20"
                        : "border-[var(--ink)]/15 hover:border-[var(--ink)]/30"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[var(--sky-dark)] flex-shrink-0" />
                    Pay Online
                  </button>
                  <button
                    type="button"
                    onClick={() => update("paymentMethod", "in_person")}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 font-bold text-sm transition-colors ${
                      form.paymentMethod === "in_person"
                        ? "border-[var(--orange)] bg-[var(--orange)]/10"
                        : "border-[var(--ink)]/15 hover:border-[var(--ink)]/30"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-[var(--orange-dark)] flex-shrink-0" />
                    Pay In Person
                  </button>
                </div>
              </div>

              <div className="border-t-2 border-[var(--ink)]/10 pt-5">
                <p className="font-bold text-sm mb-3">Review your registration</p>
                <dl className="text-sm space-y-2 opacity-80">
                  <div className="flex justify-between">
                    <dt className="opacity-60">Child</dt>
                    <dd className="font-bold">{form.childFirstName} {form.childLastName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="opacity-60">Program</dt>
                    <dd className="font-bold">
                      {PROGRAMS.find((p) => p.value === form.program)?.label}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="opacity-60">Uniform Size</dt>
                    <dd className="font-bold">{form.uniformSize}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="opacity-60">Parent</dt>
                    <dd className="font-bold">{form.parentName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="opacity-60">Proof of Insurance</dt>
                    <dd className="font-bold">
                      {files.proofOfInsurance ? "Uploaded" : "Not provided — will sign at school"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="opacity-60">School Policy</dt>
                    <dd className="font-bold">
                      {form.agreedToPolicy ? "Agreed" : "Not agreed"}
                    </dd>
                  </div>
                </dl>
              </div>

              {submitError && (
                <p className="text-sm font-bold text-[var(--orange-dark)] bg-[var(--orange)]/10 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 font-bold text-sm px-5 py-3 rounded-full disabled:opacity-30 hover:bg-[var(--ink)]/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!stepIsValid()}
              className="inline-flex items-center gap-1.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] disabled:opacity-40 disabled:hover:bg-[var(--orange)] text-white font-bold px-7 py-3 rounded-full crayon-shadow transition-colors"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!stepIsValid() || submitting}
              className="inline-flex items-center gap-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] disabled:opacity-40 disabled:hover:bg-[var(--orange)] text-white font-bold px-7 py-3 rounded-full crayon-shadow transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Registration <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}