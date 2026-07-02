# Routing eval — does description score predict routing accuracy?

**Question.** The rubric's biggest dimension (25/100) scores the frontmatter
description. Descriptions are the only thing an agent sees at skill-discovery
time, so this is the one dimension cheaply testable against behavior: do
higher-scoring descriptions route user requests more accurately?

**Method (2026-07-01).** 12-skill roster spanning description scores 5–25
(4 SkillDraft seeded skills, 8 wild ones from this corpus). Three independent
Claude router agents, each seeing ONLY the descriptions (different roster
orderings to counter position bias), judged every trial: pick the one skill
that applies, or "none". Round 1: 24 canonical requests + 4 distractors.
Round 2 ("hard mode"): 18 oblique/boundary requests, including 7 that land
inside a skill's explicit "Do not use for" exclusion zone.

## Results

- **Round 1: 84/84 (100%).** Ceiling — on a distinct-domain roster with
  canonical requests, every description routes perfectly, including the
  13-word terse ones.
- **Round 2: 48/48 unanimous-correct** on the 16 unambiguous trials. All
  **21/21 exclusion-zone rejections correct** — the routers' "none" answers
  came directly from "Do not use for" clauses (PRs, published-history
  rewrites, dependency scanning, compliance reports, infra security,
  Google Docs, page-level routing).
- The panel's **vaguest description (brand-guidelines, desc=10) produced the
  only split decision** (h14 "make error states on-brand": 1× brand-guidelines,
  2× none).
- The **broadest description (TDD, desc=5, "any feature or bugfix") unanimously
  captured** "build the login page end to end" (h18) — consistent with that
  skill's intentionally-broad design, but the behavior an over-broad
  description produces either way. It correctly did NOT capture a README typo
  fix (h16).

## Implications for the rubric

| Rubric feature | Verdict from this data |
|---|---|
| **+5 for "Do not use" exclusion clause** | **Validated** — exclusions did rejection work nothing else in the description could do (21/21). |
| +5 for "use when" trigger phrasing | Consistent with results; not isolated. |
| **12 pts for 40+ word count** | **Not supported** — terse-but-precise descriptions (13 words) routed oblique requests perfectly. Precision beat verbosity. Vagueness (not brevity) caused the one inconsistency. |

Possible future rubric tweak: shift weight from raw length toward
specificity + exclusions. Not applied yet — see caveats.

## Caveats

Small N; 12 distinct-domain skills (real installs can have 50+ overlapping
skills, where richer descriptions plausibly matter more); requests authored by
someone who had read the descriptions; routers were large Claude models
(production routing may use smaller models that lean harder on verbose
descriptions). Treat as a first behavioral data point, not a conclusion.
