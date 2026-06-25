# Seed: official flagship skills

Version-controlled source for the **verified, official** skills shown in `/explore`.
These are the "verified version of the skills people already install" — the trust-layer
seed for the registry.

## Files
- `skills/*.md` — the SKILL.md sources (one per skill).
- `seed-skills.mjs` — idempotent loader that scores each skill through the live
  `/api/verify` endpoint and upserts it into the `skills` table as `is_official = true`,
  `is_public = true`, authored as **SkillDraft**.

## Current skills
| File | Category | Targets the demand for |
|---|---|---|
| `git-commit-writer.md` | Git & PR Workflows | the most-installed skill *type* |
| `pr-description-writer.md` | Git & PR Workflows | PR descriptions (top install) |
| `postgres-query-guardrails.md` | Database & SQL | the lowest-supply real category |

All three currently score **100 / Excellent** and pass the security scan.

## Publishing
The loader writes to the production database, so it needs the service-role key
(which is not committed). Run it from a trusted environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node seed/seed-skills.mjs
```

Optional: `SEED_USER_ID` to set the owner row, `VERIFY_BASE_URL` to point the scorer
at a different deployment. Re-running replaces the official rows (idempotent).

## Adding a skill
1. Drop a new `skills/<slug>.md` (answer-first, with When-NOT-to-use, hard stops,
   anti-patterns, and a verification checklist so it scores well).
2. Add a `MANIFEST` line in `seed-skills.mjs` mapping the slug to a category.
3. Re-run the loader.
