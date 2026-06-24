import { NextRequest, NextResponse } from "next/server";
import { scoreSkill, scoreLabel } from "@/lib/scoreSkill";
import { scanSecurity } from "@/lib/scanSecurity";

export const runtime = "nodejs";

const MAX = 50_000;

/**
 * Public, unauthenticated skill verification endpoint.
 *
 * Scores a SKILL.md against the 7-dimension quality rubric and runs the
 * security scan — regardless of where the skill came from. Pure functions,
 * no credits, no DB. Intended for CI gates and programmatic checks, e.g.:
 *
 *   curl -X POST https://skilldraft.io/api/verify \
 *     -H 'content-type: application/json' \
 *     -d '{"content": "---\nname: ...\n---\n..."}'
 */
export async function POST(request: NextRequest) {
  let body: { content?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const content = body.content;
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "Provide a non-empty `content` string." },
      { status: 400 }
    );
  }
  if (content.length > MAX) {
    return NextResponse.json(
      { error: `Content exceeds ${MAX.toLocaleString()} characters.` },
      { status: 413 }
    );
  }

  const breakdown = scoreSkill(content);
  const scan = scanSecurity(content);

  return NextResponse.json({
    score: breakdown.score,
    label: scoreLabel(breakdown.score),
    passed: scan.passed,
    breakdown: {
      description: breakdown.descriptionScore,
      whenNotToUse: breakdown.whenNotScore,
      outputTemplate: breakdown.templateScore,
      antiPatterns: breakdown.antiPatternsScore,
      whyAnnotations: breakdown.whyScore,
      hardStops: breakdown.hardStopsScore,
      verificationChecklist: breakdown.checklistScore,
    },
    security: {
      passed: scan.passed,
      category: scan.category,
      reason: scan.reason,
    },
  });
}
