# Supabase migrations

SQL migrations for the SkillDraft Postgres database, named to match the
versions recorded in the Supabase project's migration history
(`YYYYMMDDHHMMSS_<name>.sql`).

> **Partial history.** This folder was introduced with the spend-guardrails
> work, so it currently contains only those migrations. The eight earlier
> migrations (`create_skills_table` … `create_verify_events`) were applied
> directly against the project before the folder existed and are **not**
> reproduced here yet. Re-running this folder against a fresh database will
> create the rate-limit / daily-cap objects but **not** the full schema. To
> get a complete from-scratch-reproducible history, back-fill the earlier
> migrations from the project (`supabase db pull`, or export each version).
