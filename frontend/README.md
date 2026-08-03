# Kizuna — Frontend

A personal password manager focused on security, simplicity, and a premium
desktop-quality experience. Built with Next.js (App Router), React 19,
TypeScript, Tailwind CSS v4, and shadcn/ui.

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. The app defaults to dark mode. The root route
is the marketing landing page; the product lives behind `/login`.

### Demo access

While the backend is not implemented, sign-in accepts exactly one demo
account (shown on the login page):

| Field    | Value            |
| -------- | ---------------- |
| Email    | `demo@kizuna.app` |
| Password | `Kizuna@2026`     |

The demo session lives in `src/lib/demo-session.ts` (localStorage) and is
enforced by `src/components/auth/auth-guard.tsx`. Both are TEMPORARY and
clearly marked — with real FastAPI auth, delete `demo-session.ts`, remove
the `!hasBackend()` branches in `services/auth.ts`, and replace the guard
with a server-side session check.

### Backend

The frontend is backend-agnostic. Point it at the FastAPI backend with:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

When `NEXT_PUBLIC_API_URL` is **unset**, the service layer transparently
falls back to an in-memory demo adapter (`src/lib/demo-db.ts`) with
simulated latency, so every screen — including create/edit/delete flows —
works end-to-end without a running backend. UI components never import
demo data directly; it flows through the same service functions the real
API uses.

## Architecture

```
src/
├── app/                  # Routes (App Router)
│   ├── (auth)/           # /login, /register
│   └── (dashboard)/      # /dashboard, /vaults, /favorites, /generator, /settings
├── components/
│   ├── ui/               # shadcn/ui primitives (generated)
│   ├── landing/          # Marketing page (navbar, hero, mockups, FAQ…)
│   │   └── globe/        # Lazy 3D "Digital World" globe (three + gsap)
│   │                     # Continent dots come from land-mask.ts — regen
│   │                     # with: node scripts/generate-land-mask.mjs
│   ├── auth/             # Auth shell, forms, auth guard
│   ├── identity/         # Digital Identity Map (d3-force canvas graph)
│   ├── security/         # AI Security Advisor (rule engine in
│   │                     # lib/advisor — swap for FastAPI + LLM later)
│   ├── dashboard/        # App shell, command palette, dashboard cards, settings
│   ├── vault/            # Vault cards, item table, CRUD dialogs, generator
│   └── shared/           # Logo, page header, empty state, password input…
├── hooks/                # TanStack Query hooks + UI utilities
│                         # lib/identity/graph.ts is the AI extension
│                         # point for future risk/cluster annotations
├── services/             # API layer (auth, vault, folders, settings)
├── store/                # Zustand stores (UI state only — never secrets)
├── providers/            # Theme, query client, tooltip, toaster
├── lib/                  # fetch wrapper, password utils, validations, query keys
├── types/                # Domain types
└── constants/            # Nav, vault icons, app config
```

### Key decisions

- **Server state vs client state** — all vault/auth data lives in the
  TanStack Query cache; Zustand holds only UI state (command palette,
  selection, search). Passwords and keys are never persisted client-side.
- **Forms** — React Hook Form + Zod resolvers, using the shadcn `Field`
  primitives. Every form has validation, loading, disabled, and error states.
- **Password generation** — `crypto.getRandomValues` locally, with
  ambiguous characters excluded; strength is an entropy estimate for UI
  feedback only.
- **Command palette** — ⌘K / Ctrl+K anywhere in the dashboard for
  navigation, vault jumping, and item search.

## Scripts

| Command      | Purpose                       |
| ------------ | ----------------------------- |
| `pnpm dev`   | Dev server (Turbopack)        |
| `pnpm build` | Production build              |
| `pnpm start` | Serve the production build    |
| `pnpm lint`  | ESLint                        |
