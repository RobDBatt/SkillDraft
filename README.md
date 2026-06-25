# SkillDraft

SkillDraft generates quality-scored `SKILL.md` files for AI coding agents (Claude Code, Cursor, Windsurf, and others). Pick a category, answer a few questions, and get a security-scanned, scored skill you can install in one command — plus a public gallery to explore, save, and remix community skills.

Live at **[skilldraft.io](https://skilldraft.io)**.

## Stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack) + **React 19** + **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com)**
- **[Supabase](https://supabase.com)** — auth (magic link) + Postgres
- **[Stripe](https://stripe.com)** — credits + payments
- **[Anthropic SDK](https://docs.claude.com)** — skill generation & improvement
- Deployed on **[Vercel](https://vercel.com)**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Environment variables

Create a `.env.local` with the following. Public (`NEXT_PUBLIC_*`) vars are exposed to the browser; the rest are server-only.

| Variable | Required | Used for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase client (browser auth/queries) |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Admin client — bypasses RLS in API routes & server components |
| `ANTHROPIC_API_KEY` | server | Generating and improving skills |
| `STRIPE_SECRET_KEY` | server | Checkout & credit purchases |
| `STRIPE_WEBHOOK_SECRET` | server | Verifying Stripe webhook signatures |
| `ADMIN_EMAILS` | server | Comma-separated allowlist for the internal `/stats` dashboard. Fails closed — unset means no one can access it. |
| `NEXT_PUBLIC_SITE_URL` | optional | Absolute URLs (sitemap, OG, redirects); falls back to the deploy URL |

> The server clients (`lib/supabase-admin.ts`, `lib/stripe.ts`) are lazily
> instantiated, so a build without the server secrets still succeeds — those
> keys are only required at runtime when a route actually uses them. Read-only
> public pages degrade to an empty state if Supabase is unreachable.

## Project layout

```
app/
  page.tsx              Marketing homepage (animated Pick → Answer → Generate pipeline)
  generate/             Skill generation wizard
  improve/              Skill improver
  explore/              Public gallery + SEO category (/c) and platform (/for) pages
  collections/          Browse / create / view skill collections
  teams/                Team & org management
  pricing/              Credits + Stripe checkout
  install/ · faq/       Static content pages
  auth/                 Supabase magic-link auth
  api/
    generate · improve  Anthropic streaming endpoints
    skills/             Public fetch / search / share (used by the CLI)
    stripe/             Checkout + webhook
components/             UI (Logo, SiteNav, Pipeline pieces, forms, …)
lib/                    Clients, prompts, scoring, security scan, rate limiting
cli/                    `npx skilldraft` — install / search / list skills
design/                 Design references (homepage prototype, brand spec, build guide)
```

## CLI

Skills published to the gallery can be installed from the terminal:

```bash
npx skilldraft install <skill-id>
```

See `cli/` and the in-app `/install` page for the full command set.

## Design references

The original high-fidelity design prototype and brand spec live in [`design/`](./design):

- `SkillDraft Homepage.html` — homepage prototype (structure + motion)
- `SkillDraft Logo.html` — brand / logo spec sheet
- `skilldraft.css` — token-driven design system
- `HOMEPAGE_HANDOFF.md` — full marketing-homepage design handoff
- `NEXTJS_GUIDE.md` — Next.js implementation guide for the homepage

These are reference material, not shipped assets — the live UI is implemented in `app/` and `components/`.
