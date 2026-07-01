/**
 * Automated SKILL.md structure scorer.
 *
 * Scores a skill file 0–100 against SkillDraft's 7-dimension structural rubric.
 * NOTE: this measures conformance to SkillDraft's house structure, not general
 * quality — real-world skills (including anthropics/skills reference files)
 * score 10–46 because they use a procedural style with none of these sections.
 * Calibration corpus + baseline: fixtures/verify-corpus/.
 *
 * Pure function — safe to call client-side or server-side.
 */

export interface QualityBreakdown {
  /** 0–100 overall score */
  score: number;
  /** 0–25: description density + trigger coverage */
  descriptionScore: number;
  /** 0–15: dedicated "When NOT to use" section */
  whenNotScore: number;
  /** 0–10: "why" annotations on rules */
  whyScore: number;
  /** 0–15: literal output template (not prose description) */
  templateScore: number;
  /** 0–10: dedicated hard-stops subsection */
  hardStopsScore: number;
  /** 0–15: anti-patterns table */
  antiPatternsScore: number;
  /** 0–10: verification checklist */
  checklistScore: number;
}

/** Returns a label for a numeric score: "Excellent" / "Good" / "Fair" / "Basic" */
export function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Basic";
}

/** Returns a Tailwind color class for a score */
export function scoreColor(score: number): string {
  if (score >= 85) return "text-green";
  if (score >= 70) return "text-amber";
  if (score >= 50) return "text-silver-mid";
  return "text-silver-faint";
}

/** Returns a Tailwind bg color for the score bar */
export function scoreBgColor(score: number): string {
  if (score >= 85) return "bg-green";
  if (score >= 70) return "bg-amber";
  if (score >= 50) return "bg-silver-mid";
  return "bg-silver-faint";
}

function extractDescription(content: string): string {
  const fm = content.match(/^---\n([\s\S]*?)\n---/m);
  if (!fm) return "";
  // description can be multi-line YAML (indented continuation)
  const raw = fm[1].match(/^description:\s*([\s\S]*?)(?=\n\w|\n---|\s*$)/m);
  if (!raw) return "";
  return raw[1].replace(/\n\s+/g, " ").trim();
}

export function scoreSkill(content: string): QualityBreakdown {
  const lower = content.toLowerCase();

  // ── 1. Description (0–25) ───────────────────────────────────────────────────
  let descriptionScore = 0;
  const desc = extractDescription(content);
  const wordCount = desc ? desc.split(/\s+/).filter(Boolean).length : 0;

  if (wordCount >= 40)      descriptionScore += 12;
  else if (wordCount >= 25) descriptionScore += 7;
  else if (wordCount >= 15) descriptionScore += 3;

  if (/use when/i.test(desc))                                descriptionScore += 5;
  if (/do not use|don'?t use|not for|avoid using/i.test(desc)) descriptionScore += 5;
  // Has multiple distinct trigger phrases (3+ comma/semicolon separated items or sentences)
  const triggerPhrases = desc.split(/[.,;]/).filter(s => s.trim().length > 8);
  if (triggerPhrases.length >= 3) descriptionScore += 3;

  descriptionScore = Math.min(25, descriptionScore);

  // ── 2. "When NOT to use" section (0–15) ─────────────────────────────────────
  let whenNotScore = 0;
  if (/##\s*when\s*not\s*to\s*use|##\s*do\s*not\s*use\s*when|##\s*avoid/i.test(content)) {
    whenNotScore = 15;
  } else if (/when\s*not\s*to\s*use|do\s*not\s*use\s*this\s*(skill|for)/i.test(lower)) {
    whenNotScore = 8;
  } else if ((lower.match(/\bdo not\b|\bnever\b|\bavoid\b/g) || []).length >= 3) {
    whenNotScore = 4;
  }

  // ── 3. "Why" annotations (0–10) ─────────────────────────────────────────────
  let whyScore = 0;
  const whyCount = (content.match(/\(because\b|\(this prevents\b|\(ensures\b|\(avoids\b|\(prevents\b|\(why\b/gi) || []).length;
  if (whyCount >= 4)      whyScore = 10;
  else if (whyCount >= 2) whyScore = 6;
  else if (whyCount >= 1) whyScore = 3;

  // ── 4. Output template (0–15) ───────────────────────────────────────────────
  let templateScore = 0;
  if (/##\s*output\s*(format|template)/i.test(content)) {
    templateScore += 8;
    // Has an actual template (code block, markdown table, or structured placeholders)
    if (/```[\s\S]*?```|\|\s*\w.*\||\[.*\]/.test(content)) templateScore += 7;
  } else if (/output\s*format|expected\s*output|response\s*format/i.test(lower)) {
    templateScore += 5;
  }

  // ── 5. Hard stops subsection (0–10) ─────────────────────────────────────────
  let hardStopsScore = 0;
  if (/###?\s*hard\s*stops?|###?\s*constraints?|###?\s*never\s*do/i.test(content)) {
    hardStopsScore = 10;
  } else if ((content.match(/^[-*]\s+(do not|never|must not|do not|forbidden)/gim) || []).length >= 2) {
    hardStopsScore = 5;
  }

  // ── 6. Anti-patterns (0–15) ─────────────────────────────────────────────────
  let antiPatternsScore = 0;
  if (/##\s*anti[-\s]?pattern/i.test(content)) {
    antiPatternsScore = 15;
  } else if (/❌|✅/.test(content)) {
    antiPatternsScore = 12;
  } else if (/wrong\s*approach|common\s*mistake|avoid.*instead/i.test(lower)) {
    antiPatternsScore = 6;
  }

  // ── 7. Verification checklist (0–10) ────────────────────────────────────────
  let checklistScore = 0;
  if (/##\s*verif(y|ication)|##\s*check(list)?/i.test(content)) {
    checklistScore = 10;
  } else if (/- \[ \]|- \[x\]|- \[×\]/i.test(content)) {
    checklistScore = 8;
  } else if (/checklist|before\s+(marking|completing|calling)\s+(the\s+task|it)\s+done/i.test(lower)) {
    checklistScore = 5;
  }

  const score = Math.min(
    100,
    descriptionScore + whenNotScore + whyScore + templateScore +
    hardStopsScore + antiPatternsScore + checklistScore
  );

  return {
    score,
    descriptionScore,
    whenNotScore,
    whyScore,
    templateScore,
    hardStopsScore,
    antiPatternsScore,
    checklistScore,
  };
}
