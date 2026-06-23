import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// POST /api/admin/notes
// Body: { registrationId, staffNotes }
// Overwrites the single staff-notes field for a child. This is one
// freeform note per child (allergies, behavior, reminders, etc.), not a
// dated log — each save replaces the previous note entirely.
export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!hasValidAdminSession(token)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase isn't configured yet. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const { registrationId, staffNotes } = body ?? {};

  if (typeof registrationId !== "string") {
    return NextResponse.json({ error: "Missing registrationId." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("registrations")
    .update({ staff_notes: typeof staffNotes === "string" ? staffNotes : "" })
    .eq("id", registrationId);

  if (error) {
    console.error("Failed to save staff notes:", error);
    return NextResponse.json({ error: "Failed to save notes." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}