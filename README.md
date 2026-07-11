# EcoVest — Portfolio Greenifier

EcoVest is a simulated stock/ETF trading account that analyzes your portfolio and proposes an explainable reallocation toward clean-energy equities and green bonds, with a full return/risk comparison and Gemini-powered natural-language insights. Built for a 12-hour hackathon spanning the Bloomberg (FinTech), OneEthos (Clean Energy), and Google Gemini API tracks.

**This is a paper-trading simulation only. There is no real brokerage connection, no real money, and no real order routing anywhere in this app.** Every account starts with $10,000 in simulated cash, every trade fills instantly at a mock listed price, and every screen that shows a balance is labeled as simulated.

## Concept

1. Sign up with an email and password. Your account starts with $10,000 in simulated cash.
2. Right after your first sign-up, a one-time **Create Your Profile** step asks for your first name, last name, and which clean-energy areas you care about (Solar, Wind, EV & Battery, Sustainable Agriculture, Water & Conservation, Green Real Estate, Hydrogen). This personalizes the rest of the app.
3. From your Account page, click **Try Sample Portfolio** to instantly buy into a pre-built 13-holding portfolio, or head to **Browse** to buy and sell any of the 19 mock stocks/ETFs yourself — including a **Recommended For You** row that surfaces holdings matching your stated interests.
4. Every buy/sell fills instantly at the dataset's listed mock price, updates your cash balance and holdings in real time, and is recorded in your transaction history. Buying a top-tier clean-energy stock or ETF (marked 🌱 Bonus) also earns a small simulated cash bonus on the spot — a lightweight, Robinhood-style incentive for supporting clean energy, entirely within the paper-trading economy.
5. The Dashboard analyzes your current holdings: sector breakdown, weighted expected return, weighted volatility, and a weighted clean-energy/ESG score (1–10).
6. A simple, explainable algorithm proposes a reallocation — trimming your lowest clean-energy-score holdings and shifting that capital into top-scoring clean-energy equities/ETFs and a green bond proxy, while capping any single sector's weight. When two candidate holdings score similarly, the one matching your stated interests gets a slightly larger share of the freed capital.
7. Click **Apply Reallocation** and the app translates the suggested move directly into a batch of sell-then-buy orders, executed through the exact same trade engine as any manual trade.
8. Gemini API calls generate: (a) plain-English ESG summaries for the 2–3 flagged (trimmed) holdings, based on a mock sustainability report excerpt, and (b) a one-paragraph rationale explaining why the reallocation was suggested.
9. A chat panel lets you ask Gemini free-form questions about any holding — grounded in the same dataset (sector, score, return, volatility, sustainability notes, and your current position size) shown on the dashboard.

## Tech stack

- **Framework:** Next.js 14 (App Router), single deployable app — API routes handle all backend logic.
- **Styling:** Tailwind CSS, navy/green/white fintech palette.
- **Charts:** Recharts (donut chart for sector breakdown, radial gauge for clean-energy tilt, bar chart for return/risk).
- **AI:** Google Gemini API (`@google/generative-ai`), used for ESG summarization, reallocation rationale, and the grounded chat assistant. All three are live API calls — no hardcoded responses.
- **Data:** Static JSON dataset of 19 stocks/ETFs/bonds (`data/holdings.json`), each with ticker, name, sector, historical average return, volatility, a 1–10 clean-energy/ESG score, one or more interest tags drawn from the same 7-category list used on the profile page, a mock 2–3 paragraph sustainability report excerpt, and a mock trading price.
- **Auth:** A lightweight custom email/password system — bcrypt-hashed passwords, JWT session tokens (`jose`) in an httpOnly cookie, and route protection via Next.js middleware. No NextAuth; this was faster to stand up for the timeline and keeps the whole auth surface in two small files (`lib/auth.ts` for password hashing, `lib/session.ts` for the JWT/cookie logic).
- **Database:** Node's built-in `node:sqlite` module (ships with Node 22.5+, zero installs). **Why not Prisma:** Prisma's `generate`/`db push` steps need to download a native query-engine binary from `binaries.prisma.sh`, and that domain was blocked in the sandbox this was built in (403 Forbidden on every attempt). Rather than ship something unverifiable, this uses Node's built-in SQLite driver instead — still genuinely SQLite, just accessed with a thin hand-written query layer (`lib/db.ts`) instead of an ORM. If you'd rather have Prisma's migrations and generated types, swapping it in is a single-file change: every other file only calls the small exported functions in `lib/db.ts`.

## Project structure

```
app/
  page.tsx                    Public marketing landing page
  login/, signup/             Auth pages
  profile/page.tsx             One-time "Create Your Profile" onboarding (name + interests)
  account/page.tsx            Cash balance, holdings, Try Sample Portfolio
  browse/page.tsx             Buy/sell any of the 19 holdings + Recommended For You
  transactions/page.tsx       Transaction history table
  dashboard/page.tsx          Sector/return/risk/reallocation dashboard + chat
  api/
    auth/signup, login, logout    Account creation & session cookie
    account/route.ts              Current account summary (cash, positions, value, profile)
    profile/route.ts              Save/load first name, last name, interest tags
    trade/route.ts                Manual buy/sell — the core trade execution path
    transactions/route.ts         Transaction history
    portfolio/sample/route.ts     Liquidate + buy into the sample portfolio
    reallocation/apply/route.ts   Recompute + execute the suggested reallocation as trades
    esg-summary/route.ts          Gemini: summarize a holding's sustainability excerpt
    rationale/route.ts            Gemini: explain the reallocation
    chat/route.ts                 Gemini: grounded Q&A chatbot
middleware.ts                 Protects /account, /browse, /transactions, /dashboard, /profile
components/                   Dashboard UI, auth-aware header, trade modal, landing page
lib/
  types.ts                    Shared TypeScript types + INTEREST_CATEGORIES list
  reallocation.ts             Portfolio metrics + reallocation algorithm (interest-aware)
  trade.ts                    executeTrade() — the one execution path every trade uses
  bonus.ts                    Clean-Energy Buy Bonus eligibility rule — shared by server + client
  db.ts                       node:sqlite-backed users/positions/transactions store
  auth.ts                     Password hashing (bcrypt) — Node-only, route handlers only
  session.ts                  JWT sign/verify + cookie helpers — edge-safe, used by middleware too
  gemini.ts                   Gemini client wrapper
data/
  holdings.json                19 mock stocks/ETFs/bonds with ESG scores, interest tags, excerpts, and prices
  samplePortfolio.json          Pre-built sample portfolio weights
```

## Running locally

Requires Node 22.5 or newer (for the built-in `node:sqlite` module).

```bash
npm install
cp .env.local.example .env.local   # add your real GEMINI_API_KEY and a random AUTH_SECRET
npm run dev
```

Open http://localhost:3000, sign up with any email/password (8+ characters), fill out the one-time **Create Your Profile** step (name + at least one clean-energy interest), then use **Try Sample Portfolio** on the Account page for the fastest path to a full dashboard. A `ecovest.db` SQLite file is created automatically in the project root on first run; the schema migrates itself, so pulling this update won't wipe accounts created before the profile step existed.

Without a `GEMINI_API_KEY` set, everything else still works fully — trading, the dashboard, and the reallocation math are all local; only the three Gemini-powered panels (ESG insight cards, rationale, chat) will show a message asking you to set the key.

To build for production: `npm run build && npm run start`.

## How EcoVest addresses each sponsor track

### Bloomberg — FinTech
This isn't just charts on top of a green theme — it's a working (simulated) brokerage: real account balances, real buy/sell execution against listed prices, a transaction ledger, and a weighted return/volatility model with a full before/after benchmark. Every trade — manual or via "Apply Reallocation" — runs through the exact same `executeTrade()` function in `lib/trade.ts`, so cash, positions, and history stay consistent no matter where a trade originates. Overselling and overspending are blocked with clear error messages, and the reallocation math is a simple, explainable weighted average — not a black box.

### OneEthos — Clean Energy
Every holding carries an explicit clean-energy/ESG score, and the dashboard's headline gauge is a "Clean-Energy Tilt Score" comparing current vs. suggested portfolios. "Apply Reallocation" doesn't just suggest a change — it executes it, moving real (simulated) capital out of low-scoring fossil-fuel holdings like Exxon and Chevron and into clean-energy equities (ENPH, FSLR, TAN, ICLN) and a green bond proxy (BGRN), with the actual dollar amount shifted shown live on the dashboard. Personalization is layered on top, not bolted on: the one-time profile step captures which clean-energy areas the user actually cares about (Solar, Wind, EV & Battery, Sustainable Agriculture, Water & Conservation, Green Real Estate, Hydrogen), which drives a "Recommended For You" list on Browse and acts as a soft tiebreaker in the reallocation math itself. A small Clean-Energy Buy Bonus (see below) gives users a direct, felt incentive to choose the greener option themselves, rather than only reacting to an algorithm's suggestion.

### Google Gemini — Best use of the Gemini API
Gemini is used in three distinct, visible ways, all wired to `process.env.GEMINI_API_KEY`:
- `POST /api/esg-summary` — summarizes a holding's mock sustainability report excerpt into a plain-English clean-energy fit explanation.
- `POST /api/rationale` — generates a one-paragraph, numbers-grounded explanation of why the reallocation was suggested.
- `POST /api/chat` — a free-form Q&A assistant, grounded in the exact holdings data and position sizes shown on the dashboard, so it won't answer from generic knowledge about a company.

## Reallocation logic, in plain terms

1. Rank current holdings by clean-energy/ESG score.
2. Trim 40% of the weight from the bottom-quartile scorers (lowest ESG scores).
3. Build the target list: a preferred set of high-scoring clean-energy equities/ETFs (ICLN, FSLR, ENPH, TAN, NEE), a green bond proxy (BGRN), plus any other dataset holding that scores 7+ **and** matches one of the user's stated interests from their profile.
4. Distribute the freed-up weight across that target list, weighted by ESG score — with a small fixed boost applied to interest-matching holdings, so when two candidates score similarly, the one aligned with the user's interests gets a slightly larger share. This never overrides the ESG ranking itself, only how freed capital is split among already-qualified targets.
5. If any sector would exceed 35% of the portfolio after step 4, scale that sector back down and redistribute the overflow into the target list (same interest-aware weighting) — preserving reasonable diversification.
6. Recompute portfolio-level expected return, volatility, and clean-energy score as weighted averages of the (now normalized) holdings.
7. On "Apply Reallocation," the server re-derives this same calculation from your live positions and profile interests (never trusting client-supplied amounts), converts each weight change into whole shares at the listed price, and executes sells before buys through the trade engine.

This is a simplified, explainable model — it uses weighted averages rather than a full covariance-based risk model, by design, so every figure can be explained on the spot. All return/risk/price figures are illustrative and simulated for demo purposes — this is not investment advice.

## Clean-Energy Buy Bonus

A small, Robinhood-style incentive layered on top of the core simulation: buying shares of a holding scoring 8+/10 on clean-energy (`GREEN_BONUS_MIN_SCORE` in `lib/bonus.ts` — currently ENPH, FSLR, TAN, ICLN, NEE, TSLA, and BGRN) instantly credits a 2% simulated cash bonus (`GREEN_BONUS_PERCENT`) on top of the trade, recorded as its own `BONUS` row in transaction history. It applies uniformly through `executeTrade()`, so it fires the same way whether the buy came from a manual order, the sample-portfolio loader, or "Apply Reallocation" — never from a sell, and never invented client-side (the server computes and credits it). Eligible holdings are marked with a 🌱 Bonus badge on Browse and in the trade confirmation modal before you buy, so — like Robinhood surfacing which stock you'll get before you complete an action — the incentive is visible up front, not a hidden surprise. This is still simulated cash; nothing here is a real reward or real money.
