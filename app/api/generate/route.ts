// Route handler for POST /api/generate
// Calls Anthropic claude-sonnet-4-6 with category-specific system prompts.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "@/lib/prompts";
import { buildUserMessage, type Answers } from "@/lib/buildMessage";
import type { Category } from "@/lib/questions";
import type { PlatformId } from "@/lib/platforms";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse | Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 }
    );
  }

  const ip = getClientIp(request);

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again tomorrow." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  let body: { category: Category; platform: PlatformId | null; answers: Answers };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { category, platform = null, answers } = body;

  if (!category || !answers) {
    return NextResponse.json(
      { error: "Missing required fields: category, answers." },
      { status: 400 }
    );
  }

  if (JSON.stringify(answers).length > 20_000) {
    return NextResponse.json(
      { error: "Answers exceed maximum allowed length." },
      { status: 413 }
    );
  }

  let userMessage: string;
  try {
    userMessage = buildUserMessage(category, platform, answers);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: getSystemPrompt(category, platform),
      messages: [{ role: "user", content: userMessage }],
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
          console.error("[/api/generate] stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (err) {
    console.error("[/api/generate] Anthropic error:", err);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 502 }
    );
  }
}
