<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Verify before you push

- A SessionStart hook (`.claude/hooks/session-start.sh`) runs `npm install` in web sessions, so a full toolchain is available locally. Do not use Vercel as the compiler.
- Before pushing: `npm run typecheck && npm run lint && npm test`. CI (`.github/workflows/ci.yml`) runs the same three on every PR.
- `npm test` runs `scripts/check-invariants.mjs` — machine-checked project rules (each caught a real bug once). If a check fails, fix the code, not the check, unless the rule itself is deliberately changing.
- Generated files have shipped with NUL-byte corruption before. The invariant script checks for this; keep that check green.

# Money & pricing

- `PACKS` is defined twice on purpose: `lib/stripe.ts` (canonical — cents, Stripe lookup keys) and `app/pricing/page.tsx` (display — dollars). Change both together; `npm test` enforces sync.
- Stripe prices are immutable and created lazily on first checkout (`getOrCreatePrice`). Changing a pack's amount or credits requires bumping its `lookupKey` version (`_v2` → `_v3`), or the old price gets reused.
- Pricing invariant: $/credit decreases monotonically with pack size, and every one-time pack stays **above** the Pro subscription's 10¢/credit — subscribing must always be the best per-credit deal.
- COGS ≈ 5–7¢ per generation/improvement (`claude-sonnet-4-6`, `max_tokens: 4096`). Keep this in mind for any pricing or free-tier change.

# Supabase

- Project: `skilldraft` (`ahzsaesigmfjzzpnjqsz`). Schema changes go through the MCP `apply_migration` tool, then mirror the exact recorded version into `supabase/migrations/<version>_<name>.sql` so repo and DB history match. (History before mid-2026 is not backfilled — see that folder's README.)
- New tables: enable RLS with **no policies** — the browser keys must not touch them; access goes through server routes using `supabaseAdmin` (service role).
- New RPCs: `SECURITY DEFINER`, `set search_path = public`, then revoke execute from `public`, **`anon`, and `authenticated`** and grant only `service_role`. `revoke from public` alone is NOT enough — Supabase grants anon/authenticated explicitly, and leaving them open lets the browser key call the function directly (this shipped as a real vulnerability once).
- Credits: `deduct_credit(user_id)` returns the new balance or `-1` if empty; `add_credits(user_id, amount)` refunds/grants.

# API route invariants (`/api/generate`, `/api/improve`)

- Order is: per-user gate (credit deduction for logged-in, IP rate limit for anon) → global daily cap → model call. Never put the cap first — an anonymous loop could exhaust it and DoS everyone.
- The anon rate limiter **fails open** (a DB blip must not lock out users); the daily cap **fails closed** (it is the spend backstop). A cap block after a credit deduction must refund via `add_credits`.
- Daily cap defaults to 250 runs/day (`lib/rateLimit.ts`), overridable via the `DAILY_RUN_CAP` env var.
- Generation cache (`lib/generationCache.ts`): only menu-only inputs are cached (any free text → bypass); only `stop_reason === "end_turn"` results are stored; Regenerate sends `fresh: true`. If you change `buildUserMessage`'s output format, bump `PROMPT_VERSION` (system-prompt edits self-invalidate — the prompt is folded into the key).

# Design system

- `--color-amber` is the brand accent and is actually **blue** (`#4D9CFF`) — don't "fix" it. Success is `text-green`; error text convention is `text-red-400`.
- Fonts via CSS vars: `var(--font-mono)`, `var(--font-serif)`, `var(--font-sans)`. Corners are sharp: `rounded-[4px]` (buttons/cards), `rounded-[2px]` (chips).
- `SiteNav` is the shared header; `/generate` intentionally has its own minimal nav. There is no shared footer.

# Workflow

- Never commit to `master` — branch as `claude/<topic>`, open a PR, merge promptly (open PRs rot). If a PR must stack on another (same files), say so in the PR body and merge base-first.
- Remote sessions can't reach production env vars; `lib/stripe.ts` and `lib/supabase-admin.ts` use lazy proxies specifically so `next build` works without secrets — keep that property when adding clients.
