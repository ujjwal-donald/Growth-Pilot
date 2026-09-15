# UPDON AI Marketing

AI-powered digital marketing platform by **UPDON Technologies**.

This repository is the Phase 1 foundation: landing site, authentication, multi-tenant workspaces, onboarding, premium dashboard, business profile, AI assistant, AI content generator, content calendar, settings, billing UI, integrations IA, and an admin portal.

## Architecture

```
Browser (Next.js App Router)
  ├── Marketing pages
  ├── Auth pages (Auth.js)
  └── SaaS dashboard (RBAC + workspace isolation)
        │
        ▼
Server actions / Route handlers   ← keep this boundary so a separate API can replace it later
        │
        ├── Prisma (PostgreSQL)
        ├── AI provider abstraction (OpenAI now, Gemini/Claude later)
        ├── Storage abstraction (local now, S3/R2 later)
        ├── Social adapters (Meta, LinkedIn, X, YouTube, GBP)
        └── Keyword providers (demo now, Keyword Planner / DataForSEO later)
```

**Multi-tenant rule:** every customer record has `workspaceId`. Users join workspaces through `WorkspaceMember` with roles Owner / Admin / Marketer / Editor / Viewer.

**Secrets:** API keys and social tokens never ship to the browser. Social tokens are encrypted at rest.

## Phase roadmap

| Phase | Scope |
| --- | --- |
| 1 (this PR) | App shell, auth, Prisma schema, onboarding, AI studio, calendar, admin |
| 2 | Social OAuth + publishing worker, GA / Search Console |
| 3 | SEO crawler, live keyword APIs, competitor crawl |
| 4 | Ad network publish, lead automation, agency white-label, PDF reports |

## Local setup

### 1. Prerequisites

- Node.js 22+
- PostgreSQL 16 (local, Docker, Neon, or Supabase)

### 2. Install

```bash
npm install
cp .env.example .env.local
cp .env.example .env
```

Prisma CLI reads `.env`. Next.js reads `.env.local`. Keep `DATABASE_URL` in both.

### 3. Required environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | App origin, e.g. `http://localhost:3000` |
| `TOKEN_ENCRYPTION_KEY` | Encrypts social tokens (32+ chars) |
| `OPENAI_API_KEY` | Optional. Without it, AI uses a structured demo provider |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google login |
| `ADMIN_EMAIL` | Optional. Matching signups become platform admins |

Leave Stripe / Razorpay / S3 / R2 empty until credentials exist.

### 4. Database

```bash
npx prisma generate
npx prisma db push
npm run db:seed   # optional: demo@updon.ai / Demo1234!
npm run dev
# Listens on IPv4 and IPv6 so Chrome's localhost (::1) works.
# Open http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000).

### How to test Phase 1

1. Sign up at `/signup` with name, email, password, company.
2. Complete onboarding (business, goal, platforms, tone).
3. Confirm dashboard KPIs and charts load at `/app`.
4. Ask the assistant for a 30-day Instagram strategy.
5. Generate a post, save a draft, schedule it, then drag it on `/app/content/calendar`.
6. Update Brand Profile and confirm later AI replies mention the business.
7. If `ADMIN_EMAIL` matched your signup, open `/admin`.

Forgot-password prints a reset URL in the terminal during development.

## Scripts

```bash
npm run typecheck
npm run lint
npm run build
```

## Deployment

- **Vercel + Neon/Supabase:** set the env vars above, run migrations (`prisma migrate deploy` after the first migration is committed), and deploy.
- **Docker:** `docker compose up db` for Postgres; `docker build` for the app image (see `Dockerfile`).

## Design

Light dashboard canvas, dark slate sidebar, indigo/teal brand, Plus Jakarta headings. Dark mode is available from the header.
