"use client";

import { useEffect, useState } from "react";
import {
  Lock,
  LogOut,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Circle,
  Download,
  LogIn,
  StickyNote,
  Save,
} from "lucide-react";

type Registration = {
  id: string;
  submitted_at: string;
  school_start_date: string | null;
  child_first_name: string;
  child_last_name: string;
  child_dob: string;
  program: string;
  uniform_size: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  emergency_contact: string;
  notes: string;
  staff_notes: string | null;
  payment_method: string;
  agreed_to_policy: boolean;
  registration_fee: number;
  first_month_tuition: number;
  first_month_total: number;
  monthly_tuition_after: number;
  files: Record<string, string>;
};

type Payment = {
  id: string;
  registration_id: string;
  month: string; // YYYY-MM-DD, always the 1st of the month
  is_paid: boolean;
  paid_on: string | null;
  note: string;
};

type AttendanceRecord = {
  id: string;
  registration_id: string;
  attendance_date: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  note: string;
};

const FIELD_LABELS: Record<string, string> = {
  nibCard: "NIB Card",
  healthCertificate: "Health Certificate",
  birthCertificate: "Birth Certificate",
  parentId: "Parent / Guardian ID",
  reportCard: "Report Card",
  proofOfInsurance: "Proof of Insurance",
};

const PROGRAM_LABELS: Record<string, string> = {
  prek3: "PreK3 (3 – 4 years)",
  prek4: "PreK4 (4 – 5 years)",
  kindergarten: "Kindergarten (5 – 6 years)",
  grade1: "Grade 1 Aftercare (6 – 8 years)",
};

function currentMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function todayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportRegistrationsToCsv(registrations: Registration[]) {
  const headers = [
    "Child First Name",
    "Child Last Name",
    "Date of Birth",
    "Program",
    "Uniform Size",
    "Parent Name",
    "Parent Email",
    "Parent Phone",
    "Emergency Contact",
    "Payment Method",
    "First Month Total",
    "Monthly After",
    "Policy Agreed",
    "Submitted At",
    "Submission ID",
  ];

  const rows = registrations.map((r) => [
    r.child_first_name,
    r.child_last_name,
    r.child_dob,
    PROGRAM_LABELS[r.program] ?? r.program,
    r.uniform_size,
    r.parent_name,
    r.parent_email,
    r.parent_phone,
    r.emergency_contact || "",
    r.payment_method,
    String(r.first_month_total),
    String(r.monthly_tuition_after),
    r.agreed_to_policy ? "Yes" : "No",
    r.submitted_at,
    r.id,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `registrations-${todayDateString()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authed, setAuthed] = useState(false);

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadRegistrations() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/registrations");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load registrations.");
      setRegistrations(json.registrations ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // On first load, try fetching registrations directly — if the session
  // cookie is still valid this succeeds immediately and skips the login
  // screen; a 401 sends the person to the login form instead.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/registrations");
        if (res.ok) {
          const json = await res.json();
          setRegistrations(json.registrations ?? []);
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      } catch {
        setAuthed(false);
      } finally {
        setCheckingSession(false);
      }
    })();
  }, []);

  async function handleLogin() {
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed.");
      setAuthed(true);
      setPassword("");
      loadRegistrations();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setRegistrations([]);
  }

  async function openDocument(path: string) {
    try {
      const res = await fetch("/api/admin/file-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Couldn't open file.");
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't open file.");
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin opacity-50" />
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-5">
        <div className="bg-white wobble crayon-shadow p-8 sm:p-10 max-w-sm w-full">
          <div className="w-12 h-12 rounded-full bg-[var(--orange)] flex items-center justify-center mb-5">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-1">Admin Login</h1>
          <p className="text-sm opacity-70 mb-6">
            Effective Learning Preschool — staff access only.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full border-2 border-[var(--ink)]/15 rounded-xl px-4 py-3 focus:border-[var(--sky-dark)] outline-none"
            />
            {loginError && (
              <p className="text-sm font-bold text-[var(--orange-dark)]">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn || password.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] disabled:opacity-40 text-white font-bold px-6 py-3 rounded-full transition-colors"
            >
              {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log In"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <header className="bg-white border-b border-[var(--ink)]/10 px-5 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-display text-xl font-semibold">Registrations</h1>
          <p className="text-xs opacity-60">Effective Learning Preschool — Admin</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRegistrationsToCsv(registrations)}
            disabled={registrations.length === 0}
            className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full hover:bg-[var(--ink)]/5 disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={loadRegistrations}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full hover:bg-[var(--ink)]/5 disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full hover:bg-[var(--ink)]/5"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        {loadError && (
          <p className="bg-[var(--orange)]/10 text-[var(--orange-dark)] font-bold text-sm rounded-xl px-4 py-3 mb-6">
            {loadError}
          </p>
        )}

        {!loading && registrations.length === 0 && !loadError && (
          <div className="text-center py-16 opacity-60">
            <FileText className="w-10 h-10 mx-auto mb-3" />
            <p className="font-bold">No registrations yet</p>
            <p className="text-sm">New submissions will show up here automatically.</p>
          </div>
        )}

        <div className="space-y-3">
          {registrations.map((reg) => (
            <RegistrationCard
              key={reg.id}
              reg={reg}
              isOpen={expandedId === reg.id}
              onToggle={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
              onOpenDocument={openDocument}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide opacity-50 mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="opacity-60">{label}</span>
      <span className="font-bold text-right">{value}</span>
    </div>
  );
}

function RegistrationCard({
  reg,
  isOpen,
  onToggle,
  onOpenDocument,
}: {
  reg: Registration;
  isOpen: boolean;
  onToggle: () => void;
  onOpenDocument: (path: string) => void;
}) {
  return (
    <div className="bg-white wobble crayon-shadow overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left"
      >
        <div>
          <p className="font-bold">
            {reg.child_first_name} {reg.child_last_name}
          </p>
          <p className="text-xs opacity-60">
            {PROGRAM_LABELS[reg.program] ?? reg.program} · Submitted{" "}
            {new Date(reg.submitted_at).toLocaleDateString()}
          </p>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
      </button>

      {isOpen && (
        <div className="border-t border-[var(--ink)]/10 px-5 sm:px-6 py-5 space-y-5">
          <Section title="Child & Program">
            <Row label="Full Name" value={`${reg.child_first_name} ${reg.child_last_name}`} />
            <Row label="Date of Birth" value={reg.child_dob} />
            <Row label="Program" value={PROGRAM_LABELS[reg.program] ?? reg.program} />
            <Row label="Uniform Size" value={reg.uniform_size} />
          </Section>

          <Section title="Parent / Guardian">
            <Row label="Name" value={reg.parent_name} />
            <Row label="Email" value={reg.parent_email} />
            <Row label="Phone" value={reg.parent_phone} />
            <Row label="Emergency Contact" value={reg.emergency_contact || "—"} />
          </Section>

          {reg.notes && (
            <Section title="Notes from Parent">
              <p className="text-sm leading-relaxed">{reg.notes}</p>
            </Section>
          )}

          <Section title="Payment">
            <Row label="Method" value={reg.payment_method === "online" ? "Online" : "In Person"} />
            <Row label="First Month Total" value={`$${reg.first_month_total}`} />
            <Row label="Monthly After" value={`$${reg.monthly_tuition_after}/mo`} />
            <Row label="School Policy" value={reg.agreed_to_policy ? "Agreed" : "Not agreed"} />
          </Section>

          <Section title="Documents">
            {Object.keys(reg.files || {}).length === 0 ? (
              <p className="text-sm opacity-60">No documents on file.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(reg.files).map(([field, path]) => (
                  <button
                    key={field}
                    onClick={() => onOpenDocument(path)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold bg-[var(--sky)]/20 hover:bg-[var(--sky)]/35 px-3 py-2 rounded-full transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {FIELD_LABELS[field] ?? field}
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </Section>

          <PaymentTracker registrationId={reg.id} />
          <AttendanceTracker registrationId={reg.id} />
          <StaffNotesEditor registrationId={reg.id} initialNotes={reg.staff_notes ?? ""} />

          <p className="text-xs opacity-40 pt-2">Submission ID: {reg.id}</p>
        </div>
      )}
    </div>
  );
}

function monthLabel(monthDate: string): string {
  // monthDate is "YYYY-MM-01" — render as "September 2026"
  const [year, month] = monthDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function PaymentTracker({ registrationId }: { registrationId: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null); // month being saved

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/payments?registrationId=${registrationId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load payments.");
        setPayments(json.payments ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    })();
  }, [registrationId]);

  const thisMonth = currentMonthStart();
  const thisMonthRecord = payments.find((p) => p.month === thisMonth);
  const isPaidThisMonth = thisMonthRecord?.is_paid ?? false;

  async function togglePaid() {
    const newValue = !isPaidThisMonth;
    setSaving(thisMonth);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          month: thisMonth,
          isPaid: newValue,
          paidOn: newValue ? todayDateString() : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save payment.");

      setPayments((prev) => {
        const others = prev.filter((p) => p.month !== thisMonth);
        return [json.payment, ...others].sort((a, b) => (a.month < b.month ? 1 : -1));
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save payment.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Section title="Payment Tracking">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin opacity-50" />
      ) : error ? (
        <p className="text-sm text-[var(--orange-dark)]">{error}</p>
      ) : (
        <>
          <button
            onClick={togglePaid}
            disabled={saving === thisMonth}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${
              isPaidThisMonth
                ? "border-[var(--sky-dark)] bg-[var(--sky)]/15"
                : "border-[var(--orange)]/40 bg-[var(--orange)]/5"
            }`}
          >
            <span className="font-bold text-sm">{monthLabel(thisMonth)}</span>
            <span className="flex items-center gap-1.5 text-sm font-bold">
              {saving === thisMonth ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPaidThisMonth ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[var(--sky-dark)]" /> Paid
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-[var(--orange-dark)]" /> Unpaid
                </>
              )}
            </span>
          </button>

          {payments.filter((p) => p.month !== thisMonth).length > 0 && (
            <div className="mt-2 space-y-1.5">
              {payments
                .filter((p) => p.month !== thisMonth)
                .map((p) => (
                  <div key={p.id} className="flex justify-between text-xs opacity-60 px-1">
                    <span>{monthLabel(p.month)}</span>
                    <span className="font-bold">{p.is_paid ? "Paid" : "Unpaid"}</span>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </Section>
  );
}

function AttendanceTracker({ registrationId }: { registrationId: string }) {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const today = todayDateString();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/attendance?registrationId=${registrationId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load attendance.");
        const todayRecord = (json.attendance ?? []).find(
          (a: AttendanceRecord) => a.attendance_date === today
        );
        setRecord(todayRecord ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    })();
  }, [registrationId, today]);

  async function handleAction(action: "check_in" | "check_out") {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, date: today, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save attendance.");
      setRecord(json.attendance);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  const checkedIn = Boolean(record?.checked_in_at);
  const checkedOut = Boolean(record?.checked_out_at);

  return (
    <Section title="Today's Attendance">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin opacity-50" />
      ) : error ? (
        <p className="text-sm text-[var(--orange-dark)]">{error}</p>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("check_in")}
            disabled={saving || checkedIn}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-bold px-3 py-2.5 rounded-xl border-2 transition-colors disabled:opacity-50 ${
              checkedIn
                ? "border-[var(--sky-dark)] bg-[var(--sky)]/15"
                : "border-[var(--ink)]/15 hover:border-[var(--sky-dark)]"
            }`}
          >
            <LogIn className="w-4 h-4" />
            {checkedIn ? `In: ${new Date(record!.checked_in_at!).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : "Check In"}
          </button>
          <button
            onClick={() => handleAction("check_out")}
            disabled={saving || !checkedIn || checkedOut}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-bold px-3 py-2.5 rounded-xl border-2 transition-colors disabled:opacity-50 ${
              checkedOut
                ? "border-[var(--orange)] bg-[var(--orange)]/10"
                : "border-[var(--ink)]/15 hover:border-[var(--orange)]"
            }`}
          >
            <LogOut className="w-4 h-4" />
            {checkedOut ? `Out: ${new Date(record!.checked_out_at!).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : "Check Out"}
          </button>
        </div>
      )}
    </Section>
  );
}

function StaffNotesEditor({
  registrationId,
  initialNotes,
}: {
  registrationId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, staffNotes: notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save notes.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save notes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Staff Notes">
      <div className="flex items-start gap-2">
        <StickyNote className="w-4 h-4 opacity-40 mt-2.5 flex-shrink-0" />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Allergies, behavior notes, reminders..."
          rows={3}
          className="flex-1 text-sm border-2 border-[var(--ink)]/15 rounded-xl px-3 py-2 focus:border-[var(--sky-dark)] outline-none resize-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || notes === initialNotes}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full bg-[var(--ink)]/5 hover:bg-[var(--ink)]/10 disabled:opacity-40 mt-1"
      >
        {saving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : saved ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sky-dark)]" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        {saved ? "Saved" : "Save Notes"}
      </button>
    </Section>
  );
}