# CLAUDE.md

## Project Overview

Pipify is a TradingView-to-MetaTrader 5 auto-trading platform. It receives trading signals from TradingView via webhooks and automatically executes them on connected MT5 accounts. The platform supports multi-user access, a signal provider marketplace (copy-trading), trade journaling, and admin management.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API routes (serverless)
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Auth**: Supabase Auth
- **Worker**: Python 3 — polls for pending signals and executes trades via MT5 API
- **Encryption**: Fernet (MT5 passwords encrypted at rest)

## Commands

```bash
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm start         # Start production server
npm run lint      # Run ESLint
```

### Python Worker

```bash
cd worker
pip install -r requirements.txt
python main.py
```

## Project Structure

```
src/
  app/
    (admin)/        # Admin dashboard routes
    (auth)/         # Login, signup, OAuth callback
    (dashboard)/    # User dashboard (accounts, trades, journal, webhook, marketplace)
    api/            # API routes (webhook ingestion, MT5 accounts, admin, marketplace)
  components/       # Reusable React components
  lib/              # Utilities (encryption, types, Supabase clients)
worker/             # Python signal-processing worker
supabase/migrations/ # SQL migration files
```

## Architecture

1. TradingView sends a webhook to `/api/webhook/[key]`
2. API route validates the key, parses the signal (JSON or plaintext), and inserts it with `status=pending`
3. Python worker polls every 2 seconds, atomically claims pending signals
4. Worker decrypts MT5 credentials, connects, and executes the order
5. Trade result is recorded; signal marked `executed` or `failed`

## Key Conventions

- Path alias: `@/*` maps to `./src/*`
- Supabase clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/admin.ts` (service-role)
- All database tables use Row-Level Security — users see only their own data, admins see everything
- MT5 passwords are never stored in plaintext; always encrypted with Fernet before database storage
- Environment variables are defined in `.env.local` (see `.env.local.example` for required keys)

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_KEY` (Fernet key)
- `NEXT_PUBLIC_APP_URL`
