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

// GET /api/admin/payments?registrationId=<uuid>
// Returns every month's payment record for one child.
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!hasValidAdminSession(token)) return unauthorized();
  if (!supabaseAdmin) return notConfigured();

  const registrationId = req.nextUrl.searchParams.get("registrationId");
  if (!registrationId) {
    return NextResponse.json({ error: "Missing registrationId." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("registration_id", registrationId)
    .order("month", { ascending: false });

  if (error) {
    console.error("Failed to load payments:", error);
    return NextResponse.json({ error: "Failed to load payments." }, { status: 500 });
  }

  return NextResponse.json({ payments: data ?? [] });
}

// POST /api/admin/payments
// Body: { registrationId, month: "YYYY-MM-01", isPaid, paidOn?, note? }
// Upserts (creates or updates) the payment record for that child + month.
export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!hasValidAdminSession(token)) return unauthorized();
  if (!supabaseAdmin) return notConfigured();

  const body = await req.json().catch(() => null);
  const { registrationId, month, isPaid, paidOn, note } = body ?? {};

  if (typeof registrationId !== "string" || typeof month !== "string") {
    return NextResponse.json({ error: "Missing registrationId or month." }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "month must be a date in YYYY-MM-DD format." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("payments")
    .upsert(
      {
        registration_id: registrationId,
        month,
        is_paid: Boolean(isPaid),
        paid_on: typeof paidOn === "string" && paidOn ? paidOn : null,
        note: typeof note === "string" ? note : "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "registration_id,month" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to save payment:", error);
    return NextResponse.json({ error: "Failed to save payment." }, { status: 500 });
  }

  return NextResponse.json({ payment: data });
}