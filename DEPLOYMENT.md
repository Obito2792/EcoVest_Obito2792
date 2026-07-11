# Deploying EcoVest (Supabase + Vercel)

EcoVest used to store user accounts, positions, and transaction history in a
local SQLite file (`ecovest.db`). That only ever worked for `npm run dev` —
Vercel's serverless functions don't have a persistent filesystem, so a
file-based database would reset on every request. This app now stores that
data in **Supabase** (hosted Postgres) instead, which works the same locally
and in production.

## 1. Create the Supabase tables

1. Go to your project at [supabase.com](https://supabase.com) (or create a
   free one).
2. Open **SQL Editor** in the left sidebar -> **New query**.
3. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
   and click **Run**. This creates the `users`, `positions`, and
   `transactions` tables. It's safe to re-run.
4. Go to **Project Settings -> API** and copy three values:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / publishable key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (click "Reveal") -> `SUPABASE_SERVICE_ROLE_KEY`

The service role key is a full-access secret — it's only ever read
server-side (`lib/supabaseAdmin.ts`, imported only by `lib/db.ts`, imported
only by API routes). It must never be prefixed `NEXT_PUBLIC_` or referenced
from a `"use client"` file. Row Level Security is enabled on all three
tables with no public policies, so the anon key alone can't read or write
anything — that's intentional, since EcoVest keeps its own email+password
login (`lib/auth.ts` + `lib/session.ts`) rather than using Supabase Auth.

## 2. Set your local `.env.local`

Copy `.env.local.example` to `.env.local` and fill in the Supabase values
from step 1, plus your existing Gemini/Vertex AI values. See that file's
comments for the Gemini credential options (inline JSON key vs. local file
path).

Run `npm install` (pulls in the new `@supabase/supabase-js` dependency),
then `npm run dev` and confirm signup/login/trading still work end to end.

## 3. Deploy to Vercel

1. Push this repo to GitHub if you haven't already (`git push origin main`).
2. Go to [vercel.com/new](https://vercel.com/new), sign in, and import the
   `EcoVest` GitHub repo. Vercel auto-detects Next.js — no build config
   changes needed.
3. Before the first deploy (or in **Project Settings -> Environment
   Variables** afterward), add every variable from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GCP_PROJECT_ID`
   - `GCP_LOCATION`
   - `GEMINI_MODEL`
   - `GCP_SERVICE_ACCOUNT_KEY` — paste the full JSON key as one value.
     **Don't** set `GOOGLE_APPLICATION_CREDENTIALS` on Vercel — there's no
     file at that path in a serverless function, so it wouldn't resolve.
   - `AUTH_SECRET` — generate a fresh one for production with
     `openssl rand -base64 32` (don't reuse your local dev value).
4. Click **Deploy**. Every subsequent `git push origin main` auto-deploys.

That's it — no `vercel.json` or other config is needed; the codebase has no
other filesystem dependencies once the two changes above (Supabase for data,
inline Gemini credentials) are in place.

## What changed in the code

- `lib/db.ts` — rewritten to call Supabase (`lib/supabaseAdmin.ts`) instead
  of `node:sqlite`. Every exported function is now `async`.
- `lib/trade.ts` and every route under `app/api/**` that touched the
  database now `await` those calls.
- `lib/gemini.ts` — now accepts a service-account key as one inline env var
  (`GCP_SERVICE_ACCOUNT_KEY`) in addition to the old file-path method, since
  Vercel has no persistent file to point `GOOGLE_APPLICATION_CREDENTIALS` at.
- `supabase/schema.sql` — new file, the Postgres schema to run once per
  Supabase project.
