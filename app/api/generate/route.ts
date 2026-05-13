// Route handler for POST /api/generate
// Calls Anthropic claude-sonnet-4-6 with category-specific system prompts.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "@/lib/prompts";
import { buildUserMessage, type Answers } from "@/lib/buildMessage";
import type { Category } from "@/lib/questions";
import type { PlatformId } from "@/lib/platforms";

// ─── Rate limiting (in-memory, resets on cold start) ─────────────────────────
// 10 generations per IP per day. No DB required for v1.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Get requester IP for rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

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
  console.log("[/api/generate] body:", JSON.stringify({ category, platform, answers }, null, 2));

  if (!category || !answers) {
    return NextResponse.json(
      { error: "Missing required fields: category, answers." },
      { status: 400 }
    );
  }

  let userMessage: string;
  try {
    userMessage = buildUserMessage(category, platform, answers);
    console.log("[/api/generate] userMessage:\n", userMessage);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: getSystemPrompt(category, platform),
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json(
      { skill: text },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (err) {
    console.error("[/api/generate] Anthropic error:", err);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 502 }
    );
  }
}
