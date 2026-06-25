---
name: pr-description-writer
description: Writes a pull request title and description from a branch's commits and diff. Use when the user says "open a PR", "write a PR description", "describe this pull request", or "PR for this branch". Do not use for writing commit messages, reviewing code, or merging.
---

# Pull Request Description Writer

Produces a reviewer-ready PR title and description that explains intent and risk — not a restatement of the diff.

## When to use this
- The user is opening a pull request, or asks for a PR description for the current branch.
- Triggers: "open a PR", "write the PR description", "PR for this branch".

## When NOT to use this
- Writing individual commit messages — use a commit skill instead.
- Reviewing or approving a PR (this skill authors the description, it does not judge the code).
- Anything that merges or pushes (because the user controls when to merge).

## Instructions

### Title
One line, Conventional-Commit style, summarising the net change (because the title becomes the squash-merge commit subject).

### Description sections, in order
- **What** — the change in one or two sentences.
- **Why** — the problem it solves or the motivation (because reviewers approve intent, not lines).
- **How** — notable implementation decisions and trade-offs only; skip the obvious.
- **Risk / rollout** — what could break, migrations, feature flags (because this is what a reviewer most needs to know).
- **Testing** — what was tested and how to verify it.

### Scope rule
If the diff touches unrelated areas, flag it and suggest splitting the PR (because large unfocused PRs get rubber-stamped or stall in review).

## Output format

```
fix(billing): prevent double-charge on retried webhooks

## What
Makes Stripe webhook handling idempotent.

## Why
Retried `invoice.paid` events charged customers twice (#871).

## How
Dedupes on the Stripe event id via a unique constraint; the second insert is a no-op.

## Risk / rollout
Adds a migration (new unique index). Safe to roll back; no data change.

## Testing
- [ ] Replayed a duplicate webhook in staging — second event ignored
- [ ] Existing single-event path unchanged
```

## Hard stops
- Never restate the diff line by line (because the diff is already attached to the PR).
- Never claim tests passed that the user did not run.
- Never include secrets, tokens, or internal URLs in the description.
- Never describe changes that are not present in the branch.

## Anti-patterns
❌ "This PR changes several files" → ✅ A one-line "What" that names the net effect
❌ Listing every modified function → ✅ Only the decisions a reviewer needs to know
❌ Empty "Risk" section → ✅ Name the migration / flag / blast radius, or write "none"
❌ Mixing a refactor + feature + dependency bump → ✅ Recommend splitting the PR

## Verification checklist
- [ ] Title is one line and summarises the net change
- [ ] What / Why / How / Risk / Testing sections are present
- [ ] Why explains motivation, not the diff
- [ ] Risk section names migrations, flags, or blast radius
- [ ] No unverified test claims and no secrets
