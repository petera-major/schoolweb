import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isSessionTokenValid } from "@/lib/adminSession";
import { supabaseAdmin, REGISTRATIONS_BUCKET } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const SIGNED_URL_EXPIRY_SECONDS = 60 * 10; // 10 minutes — long enough to view/download, short enough to limit exposure if a link is shared accidentally

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(token)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const storagePath = body?.path;

  if (typeof storagePath !== "string" || storagePath.length === 0) {
    return NextResponse.json({ error: "Missing file path." }, { status: 400 });
  }

  // Defense in depth: every stored path is "<submissionId>/<field>.<ext>" —
  // reject anything that doesn't look like that shape, so this endpoint can
  // never be tricked into signing a URL for an arbitrary, unrelated path.
  const validPathPattern = /^[a-f0-9-]{36}\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/;
  if (!validPathPattern.test(storagePath)) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase isn't configured yet. Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local." },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin.storage
    .from(REGISTRATIONS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data) {
    console.error("Failed to create signed URL:", error);
    return NextResponse.json({ error: "Failed to generate file link." }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}