import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SYSTEM_PROMPT = `You are a SKILL.md editor. Your task is to improve an existing SKILL.md file.

A SKILL.md is a structured markdown file that tells an AI agent (Claude Code, Cursor, ChatGPT, Windsurf, etc.) how to work within a specific domain — the user's preferred tools, patterns, constraints, and conventions.

When improving a SKILL.md:
- Make instructions more precise and actionable — replace vague language with concrete directives
- Fill gaps: what context would the agent need that is currently missing?
- Strengthen constraints: passive suggestions become firm directives
- Remove redundant or conflicting rules
- Improve structure: clearer headings, better logical grouping
- Sharpen trigger phrases so the skill activates on the right tasks
- Fix any markdown formatting issues

Output format — follow this exactly, no other text, no code fences:
1. The complete improved SKILL.md (begin immediately with the first line, no preamble)
2. The exact string on its own line: ---NOTES---
3. 3–6 bullet points listing the specific changes made, each starting with "- "`;

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
