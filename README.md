# Cashflow + Pay Myself App

Private finance web app for importing monthly bank/credit statements, summarizing inflows/outflows/net, and computing a recommended "Pay Myself" draw from backup savings.

## Stack

- Next.js 14 App Router + TypeScript + Tailwind
- Supabase (Auth + Postgres)
- PapaParse (CSV parsing)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.local.example .env.local
   ```
3. Fill in `.env.local` values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional server usage)

## Supabase schema migration

Run migration SQL from `db/migrations/001_initial.sql` in your Supabase SQL editor.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Implemented features

- Auth pages (`/login`, `/signup`) and protected routes (`/dashboard`, `/upload`, `/transactions`, `/settings`)
- Accounts + settings management
- CSV upload, client-side parse, column mapping, amount inversion option
- Transaction import with dedupe via `sha256(user|account|date|amount|normalizedDescription)`
- Transactions page with month/account filtering and pagination
- Dashboard monthly summary and pay-myself recommendation:
  - `baseline_draw = baseline_monthly_draw > 0 ? baseline_monthly_draw : target_monthly_housing_cost`
  - `deficit = max(0, -net)`
  - `surplus = max(0, net)`
  - `recommended_draw = max(0, baseline_draw + deficit - surplus)`

## Tests

- Unit tests for import normalization and fingerprint stability in `lib/import/normalize.test.ts`.
