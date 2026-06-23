import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isSessionTokenValid } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(token)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase isn't configured yet. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local." },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("registrations")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Failed to load registrations:", error);
    return NextResponse.json({ error: "Failed to load registrations." }, { status: 500 });
  }

  return NextResponse.json({ registrations: data ?? [] });
}