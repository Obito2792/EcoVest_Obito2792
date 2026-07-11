-- EcoVest — Supabase/Postgres schema
--
-- This replaces the local node:sqlite database (ecovest.db) that only ever
-- worked for local dev — Vercel's serverless functions have no persistent
-- filesystem, so a file-based SQLite db can't survive between requests.
--
-- HOW TO RUN THIS:
--   Supabase dashboard -> your project -> SQL Editor -> New query -> paste
--   this whole file -> Run. Safe to re-run (every statement is idempotent).
--
-- SECURITY MODEL:
--   Row Level Security is enabled on every table below, and NO policies are
--   defined. That means the public "anon"/publishable key literally cannot
--   read or write a single row here — which is what we want, since EcoVest
--   keeps its own email+password login and session cookie (see lib/auth.ts
--   and lib/session.ts) rather than using Supabase Auth. All real access
--   happens server-side, from Next.js API routes, using the SERVICE ROLE key
--   (SUPABASE_SERVICE_ROLE_KEY — kept secret, never sent to the browser),
--   which bypasses RLS by design. Do NOT add public RLS policies to these
--   tables — that would let anyone holding the public anon key read or
--   write every user's email, password hash, and portfolio.
--
-- Column names are kept camelCase (quoted) to match the app's existing
-- TypeScript types (UserRow/PositionRow/TransactionRow in lib/db.ts) exactly,
-- so no field-name remapping was needed in the application code.

create extension if not exists "pgcrypto";

create table if not exists "users" (
  "id" uuid primary key default gen_random_uuid(),
  "email" text unique not null,
  "passwordHash" text not null,
  "cashBalance" double precision not null default 10000,
  "firstName" text,
  "lastName" text,
  -- JSON-encoded array of INTEREST_CATEGORIES strings, e.g. '["Solar","Wind"]'
  -- — kept as plain text (not jsonb) to match the app's existing
  -- JSON.parse/JSON.stringify handling in lib/trade.ts and lib/db.ts.
  "interests" text not null default '[]',
  "createdAt" timestamptz not null default now()
);

create table if not exists "positions" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" uuid not null references "users"("id") on delete cascade,
  "ticker" text not null,
  "shares" integer not null,
  unique ("userId", "ticker")
);

create table if not exists "transactions" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" uuid not null references "users"("id") on delete cascade,
  "ticker" text not null,
  "side" text not null check ("side" in ('BUY', 'SELL', 'BONUS')),
  "shares" integer not null,
  -- double precision (not numeric) so PostgREST/Supabase returns these as
  -- JSON numbers rather than strings — matches the REAL type the app used
  -- under SQLite, and avoids extra string<->number coercion in the app code.
  "price" double precision not null,
  "cashAfter" double precision not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists "transactions_userId_createdAt_idx"
  on "transactions" ("userId", "createdAt" desc);

alter table "users" enable row level security;
alter table "positions" enable row level security;
alter table "transactions" enable row level security;
