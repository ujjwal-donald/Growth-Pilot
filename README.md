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

## Environments (dev / test / prod)

The complete app lives on Git. Work is promoted across **three git branches**, each mapped to a **GitHub Environment** and a **Neon database**. Connection strings stay in GitHub secrets — they are never committed.

| Git branch | GitHub Environment | `APP_ENV` | Neon database | Typical use |
| --- | --- | --- | --- | --- |
| `development` | `development` | `development` | Neon **dev** | Day-to-day work, previews |
| `test` | `test` | `test` | Neon **test** | Staging / QA |
| `production` | `production` | `production` | Neon **prod** | Live app |

**Promote flow:** merge into `development` → merge `development` into `test` → merge `test` into `production`. Do not commit `.env` files.

Create those names under the repo **Settings → Environments**. In each environment add:

| Secret | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** URI (hostname contains `-pooler`) |
| `DIRECT_URL` | Neon **direct** URI (no `-pooler`) |
| `AUTH_SECRET` | Long random secret |
| `TOKEN_ENCRYPTION_KEY` | Long random secret |

Prisma CLI (`migrate`, `db push`) uses `DIRECT_URL` when set. The Next.js app uses `DATABASE_URL`.

```bash
npx prisma generate
npm run prisma:target   # prints host / database name only — no passwords
# After you review the host, create the first migration when you are ready:
# npx prisma migrate dev --name init
```

Do not put `.env` in git. Copy `.env.example` only on a machine that needs to run commands, then paste the matching Neon URLs from the GitHub Environment.

CI (`.github/workflows/ci.yml`) runs generate + lint + typecheck on PRs and on pushes to `development`, `test`, `production`, and `main`. A push to an environment branch runs `prisma migrate deploy` against the matching GitHub Environment when those secrets exist. Migrations are skipped until `prisma/migrations` has a committed migration.

### How to test Phase 1

1. Sign up at `/signup` with name, email, password, company.
2. Complete onboarding (business, goal, platforms, tone).
3. Confirm dashboard KPIs and charts load at `/app`.
4. Ask the assistant for a 30-day Instagram strategy.
5. Generate a post, save a draft, schedule it, then drag it on `/app/content/calendar`.
6. Update Brand Profile and confirm later AI replies mention the business.
7. If `ADMIN_EMAIL` matched your signup, open `/admin`.

Forgot-password prints a reset URL in the server logs during development.

## Scripts

```bash
npm run typecheck
npm run lint
npm run build
npm run prisma:target
```

## Deployment

Point the host (Vercel, Render, or similar) at this repository. Map **dev / test / prod** to the three GitHub Environments (or the host’s equivalent env groups) and set the same secrets. After the first migration is committed, production deploys should run `npx prisma migrate deploy` against `DIRECT_URL`.

## Design

Light dashboard canvas, dark slate sidebar, indigo/teal brand, Plus Jakarta headings. Dark mode is available from the header.
