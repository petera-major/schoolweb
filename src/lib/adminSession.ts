import { createHmac, timingSafeEqual } from "crypto";

// Simple shared-password admin session, suitable for a small school site
// where the owner and one teacher share access — not a full per-user account
// system. Security comes from:
//  1. The password itself is checked against ADMIN_PASSWORD (server env var,
//     never sent to the browser).
//  2. On success, we issue a cookie containing a HMAC-signed timestamp, so
//     the cookie's authenticity can be verified without storing sessions in
//     a database. A forged cookie (wrong signature) is rejected.
//  3. Cookie is httpOnly + secure + sameSite=lax, so it can't be read by
//     client-side JS and isn't sent on cross-site requests.

export const ADMIN_COOKIE_NAME = "elpai_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set in environment variables. Set it to any long random string in .env.local."
    );
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Builds the cookie value: "<issuedAtMs>.<signature>" */
export function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  const signature = sign(issuedAt);
  return `${issuedAt}.${signature}`;
}

/** Verifies a session token's signature and expiry. */
export function isSessionTokenValid(token: string | undefined | null): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [issuedAt, signature] = parts;

  if (!/^\d+$/.test(issuedAt)) return false;

  const expectedSignature = sign(issuedAt);

  // Constant-time comparison to avoid timing attacks on the signature check.
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  const ageMs = Date.now() - Number(issuedAt);
  if (ageMs < 0) return false; // issued in the future — clock skew or tampering
  if (ageMs > SESSION_MAX_AGE_SECONDS * 1000) return false; // expired

  return true;
}

export function checkAdminPassword(candidate: string): boolean {
  const correct = process.env.ADMIN_PASSWORD;
  if (!correct) {
    throw new Error(
      "ADMIN_PASSWORD is not set in environment variables. Set it in .env.local."
    );
  }
  // Constant-time comparison so response timing can't leak how many
  // characters of the password were correct.
  const a = Buffer.from(candidate);
  const b = Buffer.from(correct);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;

/**
 * Shared helper for admin API routes: checks the session cookie on a
 * NextRequest and returns whether it's valid. Routes still need to import
 * ADMIN_COOKIE_NAME themselves to read the cookie value — this just
 * centralizes the validity check so it can't drift between routes.
 */
export function hasValidAdminSession(token: string | undefined | null): boolean {
  return isSessionTokenValid(token);
}