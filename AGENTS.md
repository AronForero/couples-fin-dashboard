# AGENTS.md

## What This Is

Next.js 14 App Router frontend for a couples' finance dashboard (**FinDuo**). This repo is **frontend only** — it proxies API calls to a separate Python/FastAPI backend via Next.js rewrites.

## Commands

```bash
npm run dev      # dev server on localhost:3000
npm run build    # production build (standalone output)
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
```

No test suite exists. No typecheck script — `tsc --noEmit` is implicit via `next build`.

## Architecture

- **API proxy**: All `/api/*` requests rewrite to `API_INTERNAL_URL` (default `http://localhost:8000`). Never call the backend directly from client code — always go through `/api/`.
- **Auth**: JWT stored in `localStorage` under `finduo_token`. Auth context (`src/lib/auth.tsx`) wraps the entire app. Login uses JSON, register uses JSON.
- **Route groups**: `(authenticated)/` layout guards protected pages. Unauthenticated users redirect to `/login`.
- **Path alias**: `@/*` maps to `./src/*`.

## Pages

| Route | Description |
|---|---|
| `/login` | Email/password login |
| `/register` | Create account |
| `/balance` | Monthly balance with "Tu dinero real" card, shared + personal expenses, couple selector |
| `/expenses` | Unified transactions (expenses + incomes) with filters, edit modal |
| `/invite` | Invite code display + join form (for solo users) |
| `/couple/manage` | Active couple + historical couples, leave couple |
| `/couple/[coupleId]/expenses` | Read-only view of past couple's expenses |

## Key Files

- `src/lib/api.ts` — all API calls (auth, expenses, incomes, balance, actual money, couple lifecycle)
- `src/lib/auth.tsx` — AuthProvider context, token management, `isActive` status check, couple members
- `src/types/index.ts` — shared TypeScript interfaces (User, Expense, Income, Transaction, BalanceResponse, ActualMoneyResponse, CoupleHistory, etc.)
- `src/app/(authenticated)/layout.tsx` — auth guard + Navbar + InviteBanner
- `src/components/ActualMoneyCard.tsx` — "Tu dinero real" card (ingresos − gastos)
- `src/components/ExpenseTable.tsx` — type-aware table (expense + income rows), edit action

## User Status

- `trial` (first 30 days) — full access, yellow banner with days remaining
- `active` — full access, no banner
- `suspended` — read-only mode, coral banner

## Environment

| Variable | Purpose | Default |
|----------|---------|---------|
| `API_INTERNAL_URL` | Backend URL for rewrite proxy | `http://localhost:8000` |

Set in `.env.local` for local dev. In Docker, passed as build arg and runtime env.

## Docker

Multi-stage Dockerfile produces standalone Node.js server. Designed to slot into the backend's `docker-compose.yml` as a `dashboard` service — see `docker-compose.snippet.yml`.

## Conventions

- UI language is Spanish (labels, routes, field names like `quien_pago`, `compartida`, `categoria`)
- Backend field names use snake_case — map to camelCase in TypeScript only when it improves readability (currently kept as snake_case in types)
- Tailwind CSS for all styling — no CSS modules or styled-components
