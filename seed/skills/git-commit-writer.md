---
name: git-commit-writer
description: Writes Conventional Commit messages for staged changes. Use when the user says "commit this", "write a commit message", "what's a good commit message", or is about to commit. Do not use for writing code, opening pull requests, or rewriting published git history.
---

# Git Commit Writer

Generates a single, well-formed Conventional Commit message for the currently staged changes, following the team's format exactly.

## When to use this
- The user asks to commit, or for a commit message, for already-staged changes.
- Triggers: "commit this", "write a commit message", "good commit message for this".

## When NOT to use this
- Writing or modifying code (this skill only describes changes, it does not make them).
- Opening or describing pull requests — use a PR skill instead.
- Rewriting or amending already-pushed history (because it corrupts teammates' clones).

## Instructions

### Commit format
Use Conventional Commits: `type(scope): subject`.
- `type` is one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore.
- `subject` is imperative mood, lower-case, no trailing period, under 72 characters (because the subject is truncated in most git UIs and in `git log --oneline`).
- Add a body only when the change needs a "why" — wrap at 72 columns and explain the motivation, not the diff (because the diff is already visible; the reasoning is not).
- Reference the issue in a footer: `Refs #123` (because it links the change to its rationale for future archaeology).

### Scope rule
One logical change per commit. If the staged diff mixes a refactor and a feature, stop and tell the user to split the commit (because mixed commits are impossible to review or revert cleanly).

## Output format
Return only the commit message, ready to paste:

```
feat(auth): add rate limiting to login endpoint

Brute-force attempts were not throttled. Adds a 5/min per-IP limit
backed by the existing rate-limit middleware.

Refs #412
```

## Hard stops
- Never invent a change that isn't in the staged diff (because the message must describe reality).
- Never write a vague subject like "fix", "update", or "changes" (because it makes the log useless).
- Never include secrets, file dumps, or generated output in the message.
- Never suggest `--force` or amending already-pushed commits.

## Anti-patterns
❌ `update files` → ✅ `refactor(api): extract response builder from route handler`
❌ Body restating the diff line by line → ✅ Body explaining why the change was needed
❌ One commit for an unrelated refactor + feature → ✅ Split into two focused commits
❌ `Fixed bug.` (past tense, vague, capitalised) → ✅ `fix(parser): handle empty CSV header row`

## Verification checklist
- [ ] Subject uses a valid Conventional Commit type and imperative mood
- [ ] Subject is under 72 characters with no trailing period
- [ ] Body, if present, explains why and not what
- [ ] Issue referenced when one applies
- [ ] Message describes only what is actually staged
