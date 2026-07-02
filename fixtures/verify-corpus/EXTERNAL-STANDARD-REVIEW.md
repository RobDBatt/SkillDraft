# SkillDraft skills judged against external standards

Inversion of the usual comparison (2026-07-02): instead of scoring wild skills
on SkillDraft's rubric, three representative SkillDraft seeded skills
(git-commit-writer, a11y-accessibility-audit, sql-query-guardrails) were graded
against the two most-used external standards, by independent judge agents that
saw only the standard and the skill text. All 15 seeded skills also went
through a mechanical spec-compliance check.

## Results

**Official spec hard constraints (all 15 skills):** 15/15 pass everything —
valid names, descriptions at ~27% of the 1024-char limit, bodies 58–100 lines
vs the 500-line guidance, imperative voice.

**vs Anthropic's skill-creator authoring guidance:** A-, B+, B.
Praised: exact output templates, brevity, section-level "(because …)"
rationales. Systematic template flaws:
1. "When to use this" duplicated in the body — the guidance says ALL
   when-to-use info belongs in the description only.
2. ❌/✅ fragments instead of one full worked Input → Output example
   (13/15 skills have no worked example).
3. "Musty MUSTs" gradient — hard stops lose their rationales as domains get
   more safety-flavored, the opposite of the guidance's explain-why principle.

**vs superpowers writing-skills (community standard):** B-, B, C+.
Bodies praised as strong craft; all three FAIL its core rule: descriptions
lead with a WHAT-summary ("Writes Conventional Commit messages…", "Audits …
against WCAG 2.1 AA") naming frameworks the model already knows — per their
tested rationale, that invites the agent to act from the description and skip
the body, which is where SkillDraft's differentiating content (hard stops,
output contracts) lives. Also: checklists sometimes restate instructions ~1:1
(token inefficiency), and sql-query-guardrails arguably bundles two concerns
(safety review vs optimization).

## The standards conflict — and SkillDraft has picked a side

Anthropic's guidance: descriptions should include "both what the skill does
AND specific contexts for when to use it", deliberately "pushy".
Superpowers' guidance: descriptions are triggering conditions ONLY; any
what/workflow summary becomes a shortcut agents take instead of reading the
body. These directly contradict. SkillDraft's generator (and rubric) follow
Anthropic's side. Note: the routing eval (ROUTING-EVAL.md) validated that
these descriptions *route* perfectly; superpowers' concern is a different,
untested behavior — post-trigger body-skipping.

## Candidate generator improvements (lib/prompts.ts), all standards-agreed

1. Drop the body "When to use this" section (pure duplication of the
   description — both standards agree).
2. Require one full worked Input → Output example per skill.
3. Require a "(because …)" rationale on every hard stop, not just instructions.
4. De-duplicate verification-checklist items that restate instructions
   verbatim.

Not applied — generation-prompt changes alter all future output and deserve
their own pass (they also self-invalidate the generation cache by design).
