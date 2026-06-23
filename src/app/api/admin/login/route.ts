import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  checkAdminPassword,
  createSessionToken,
  SESSION_COOKIE_MAX_AGE,
} from "@/lib/adminSession";

export const runtime = "nodejs";

// Basic in-memory rate limiting per server instance: slows down password
// guessing without needing a database. Resets on server restart/redeploy,
// which is an acceptable tradeoff for a small school site.
const attempts = new Map<string, { count: number; firstAttemptAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for") || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const clientKey = getClientKey(req);
    const now = Date.now();
    const record = attempts.get(clientKey);

    if (record) {
      if (now - record.firstAttemptAt > WINDOW_MS) {
        attempts.delete(clientKey);
      } else if (record.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: "Too many attempts. Please try again later." },
          { status: 429 }
        );
      }
    }

    const body = await req.json().catch(() => null);
    const password = body?.password;

    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    let valid: boolean;
    try {
      valid = checkAdminPassword(password);
    } catch (err) {
      console.error("Admin login config error:", err);
      return NextResponse.json(
        { error: "Admin login isn't configured yet. Set ADMIN_PASSWORD in .env.local." },
        { status: 500 }
      );
    }

    if (!valid) {
      const updated = record
        ? { count: record.count + 1, firstAttemptAt: record.firstAttemptAt }
        : { count: 1, firstAttemptAt: now };
      attempts.set(clientKey, updated);

      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    attempts.delete(clientKey);

    const token = createSessionToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error("Admin login failed:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}