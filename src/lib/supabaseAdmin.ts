import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client. Uses the SECRET/service-role key, which has
// full read/write access and bypasses Row Level Security — this must NEVER
// be exposed to the browser. Only import this file from API routes / server
// components, never from a "use client" file.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// IMPORTANT: createClient() throws immediately if given an empty/invalid URL
// — it does NOT fail gracefully. If we called createClient() unconditionally
// at module load time (like a previous version of this file did), the whole
// app would crash at build time and every API route that imports this file
// would 500, the moment SUPABASE_URL / SUPABASE_SECRET_KEY are unset. Instead,
// we only construct the real client when both vars are present, and export a
// typed null otherwise — every caller below checks for null before using it,
// so a missing config degrades to "feature unavailable" instead of crashing.
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseSecretKey
    ? createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

if (!supabaseAdmin) {
  console.warn(
    "Supabase env vars missing (SUPABASE_URL / SUPABASE_SECRET_KEY) — document storage and the admin dashboard will not work until these are set in .env.local (and the server restarted)."
  );
}

export const REGISTRATIONS_BUCKET = "registrations";