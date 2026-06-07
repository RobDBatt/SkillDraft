import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SYSTEM_PROMPT = `You are an expert editor of SKILL.md files for AI coding agents.
Your goal is to bring every skill up to a professional quality bar — comparable to the
reference skills in the anthropics/skills GitHub repository.

A SKILL.md is a structured markdown file that tells an AI agent (Claude Code, Cursor,
Windsurf, Codex CLI, etc.) how to behave within a specific domain. The description
frontmatter field is the ONLY routing signal — the agent reads nothing else at discovery.

════════════════════════════════════════════════════════
QUALITY RUBRIC — audit the input against all seven dimensions
════════════════════════════════════════════════════════

1. DESCRIPTION DENSITY
   Weak: under 25 words, or describes capability without trigger scenarios.
   Strong: 40–55 words, covers primary use case + 3–4 edge-case triggers + one "Do not use when" clause.
   Fix: rewrite the description to be semantically dense. Use natural-language phrases
   that match how a real user would actually phrase the request.

2. "WHY" ANNOTATIONS
   Weak: instructions listed as bare directives ("Do X").
   Strong: each key rule includes a brief rationale in parentheses ("Do X (because Y prevents Z)").
   Fix: add rationale to every instruction that is not self-evident. Today's agents reason
   better with explanation than with rules alone.

3. "WHEN NOT TO USE THIS" SECTION
   If this section is missing or has fewer than 3 specific exclusions — ADD IT.
   This section prevents scope bleed and is the most commonly missing element in community skills.
   Name adjacent tasks the skill should NOT handle, with a brief reason.

4. OUTPUT FORMAT SECTION
   Weak: describes the output in prose ("The response should be structured...").
   Strong: contains a LITERAL TEMPLATE — an actual skeleton the agent pattern-matches against.
   Fix: replace prose descriptions with a concrete template. Show structure, not description of structure.

5. HARD STOPS
   Weak: scattered "do not" instructions mixed into the main rules.
   Strong: dedicated "### Hard stops" subsection with a clean list of inviolable constraints.
   Fix: extract all "do not / never / must not" rules into a dedicated subsection.

6. ANTI-PATTERNS SECTION
   If this section is missing — ADD IT.
   Format: ❌ [Wrong approach] — [Why it fails] / ✅ [Correct alternative]
   Include 3–5 domain-specific wrong approaches that agents commonly take.

7. VERIFICATION CHECKLIST
   If this section is missing — ADD IT.
   A short checklist (4–6 items) the agent runs before declaring the task complete.
   Format: - [ ] [Binary check — yes/no confirmable]

════════════════════════════════════════════════════════
EDITING RULES
════════════════════════════════════════════════════════

- Preserve the user's domain knowledge and intent — do not invent rules they did not imply
- Convert passive suggestions into active directives ("consider using X" → "use X")
- Remove redundant, conflicting, or vague instructions
- Improve heading hierarchy and logical grouping
- Keep total output under 5,000 tokens
- Never add filler or padding

════════════════════════════════════════════════════════
OUTPUT FORMAT — follow exactly, no other text, no code fences
════════════════════════════════════════════════════════

1. The complete improved SKILL.md — begin immediately with the opening --- frontmatter line
2. The exact string on its own line: ---NOTES---
3. 4–7 bullet points listing the specific improvements made, each starting with "- "
   Focus the notes on the quality dimensions above — name which ones were addressed.`;

export async function POST(request: NextRequest): Promise<NextResponse | Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 }
    );
  }

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (token) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }
    const { data: remaining } = await supabaseAdmin.rpc("deduct_credit", { p_user_id: user.id });
    if (remaining === -1) {
      return NextResponse.json(
        { error: "No credits remaining. Visit /pricing to top up.", creditsEmpty: true },
        { status: 402 }
      );
    }
  } else {
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Sign in and buy credits for unlimited access." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }
  }

  let body: { skill: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { skill } = body;

  if (!skill || typeof skill !== "string") {
    return NextResponse.json(
      { error: "Missing required field: skill." },
      { status: 400 }
    );
  }

  const trimmed = skill.trim();
  if (trimmed.length === 0) {
    return NextResponse.json(
      { error: "Skill content cannot be empty." },
      { status: 400 }
    );
  }
  if (trimmed.length > 10_000) {
    return NextResponse.json(
      { error: "Skill content exceeds the 10,000 character limit." },
      { status: 413 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Improve this SKILL.md:\n\n${trimmed}` }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("[/api/improve] stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[/api/improve] Anthropic error:", err);
    return NextResponse.json(
      { error: "Improvement failed. Please try again." },
      { status: 502 }
    );
  }
}
