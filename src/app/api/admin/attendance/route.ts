import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
}

function notConfigured() {
  return NextResponse.json(
    { error: "Supabase isn't configured yet. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local." },
    { status: 500 }
  );
}

// GET /api/admin/attendance?date=YYYY-MM-DD
// Returns every child's attendance record for one day — this is the shape
// the dashboard needs for a daily "who's checked in" view.
//
// GET /api/admin/attendance?registrationId=<uuid>
// Returns one child's full attendance history instead, newest first.
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!hasValidAdminSession(token)) return unauthorized();
  if (!supabaseAdmin) return notConfigured();

  const date = req.nextUrl.searchParams.get("date");
  const registrationId = req.nextUrl.searchParams.get("registrationId");

  if (!date && !registrationId) {
    return NextResponse.json({ error: "Provide either date or registrationId." }, { status: 400 });
  }

  let query = supabaseAdmin.from("attendance").select("*");

  if (date) {
    query = query.eq("attendance_date", date);
  } else if (registrationId) {
    query = query.eq("registration_id", registrationId).order("attendance_date", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load attendance:", error);
    return NextResponse.json({ error: "Failed to load attendance." }, { status: 500 });
  }

  return NextResponse.json({ attendance: data ?? [] });
}

// POST /api/admin/attendance
// Body: { registrationId, date: "YYYY-MM-DD", action: "check_in" | "check_out" | "set_note", note? }
export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!hasValidAdminSession(token)) return unauthorized();
  if (!supabaseAdmin) return notConfigured();

  const body = await req.json().catch(() => null);
  const { registrationId, date, action, note } = body ?? {};

  if (typeof registrationId !== "string" || typeof date !== "string") {
    return NextResponse.json({ error: "Missing registrationId or date." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date must be in YYYY-MM-DD format." }, { status: 400 });
  }
  if (!["check_in", "check_out", "set_note"].includes(action)) {
    return NextResponse.json({ error: "action must be check_in, check_out, or set_note." }, { status: 400 });
  }

  // Fetch any existing row for this child + day first, since check-in and
  // check-out are two separate actions that both touch the same row.
  const { data: existing } = await supabaseAdmin
    .from("attendance")
    .select("*")
    .eq("registration_id", registrationId)
    .eq("attendance_date", date)
    .maybeSingle();

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    registration_id: registrationId,
    attendance_date: date,
  };

  if (action === "check_in") {
    updates.checked_in_at = now;
    if (existing?.checked_out_at) updates.checked_out_at = existing.checked_out_at;
  } else if (action === "check_out") {
    if (!existing?.checked_in_at) {
      return NextResponse.json(
        { error: "Can't check out before checking in." },
        { status: 400 }
      );
    }
    updates.checked_in_at = existing.checked_in_at;
    updates.checked_out_at = now;
  } else if (action === "set_note") {
    updates.checked_in_at = existing?.checked_in_at ?? null;
    updates.checked_out_at = existing?.checked_out_at ?? null;
    updates.note = typeof note === "string" ? note : "";
  }

  const { data, error } = await supabaseAdmin
    .from("attendance")
    .upsert(updates, { onConflict: "registration_id,attendance_date" })
    .select()
    .single();

  if (error) {
    console.error("Failed to save attendance:", error);
    return NextResponse.json({ error: "Failed to save attendance." }, { status: 500 });
  }

  return NextResponse.json({ attendance: data });
}