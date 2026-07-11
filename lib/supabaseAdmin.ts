import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client, authenticated with the service role key so it
// can read/write every table regardless of Row Level Security. This file
// must NEVER be imported from a "use client" component or anything that
// ships to the browser — the service role key is a full-access secret.
// It's only ever imported from lib/db.ts, which in turn is only imported by
// server-side API route handlers (app/api/**/route.ts).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing Supabase server env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.local.example / supabase/schema.sql)."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
