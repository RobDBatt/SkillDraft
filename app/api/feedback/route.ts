// Route handler for POST /api/feedback
// Stores user-submitted feedback (requests, recommendations, bug reports).
// Spam-throttled by IP via the shared bump_rate_limit RPC + a honeypot field.

import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rateLimit";
import { supabaseAdmin } from "@/lib/supabase-admin";

const KINDS = new Set(["request", "recommendation", "bug", "other"]);

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { message?: string; email?: string; kind?: string; hp?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Honeypot: real users never see this field. If it's filled, a bot did it —
  // pretend success and store nothing.
  if (typeof body.hp === "string" && body.hp.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 413 });
  }

  const email = (body.email ?? "").trim().slice(0, 320) || null;
  const kind = body.kind && KINDS.has(body.kind) ? body.kind : "other";

  // Spam throttle — 5 submissions / hour / IP. Fail open on a DB error so a blip
  // doesn't silently swallow genuine feedback.
  try {
    const ip = getClientIp(request);
    const { data: allowed, error } = await supabaseAdmin.rpc("bump_rate_limit", {
      p_key: `feedback:${ip}`,
      p_limit: 5,
      p_window_seconds: 3600,
    });
    if (error) throw error;
    if (allowed === false) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }
  } catch (err) {
    console.error("[/api/feedback] rate limit check failed, allowing:", err);
  }

  // Associate the logged-in user when there is one (best effort).
  let userId: string | null = null;
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      userId = user?.id ?? null;
    } catch {
      // ignore — anonymous feedback is fine
    }
  }

  // try/catch on top of the error check: supabaseAdmin is a lazy proxy that
  // throws synchronously when the service key is missing/misconfigured —
  // without this, that surfaces as an opaque empty-body 500 instead of JSON.
  try {
    const { error } = await supabaseAdmin.from("feedback").insert({
      kind,
      message,
      email,
      user_id: userId,
      user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[/api/feedback] insert failed:", err);
    return NextResponse.json(
      { error: "Could not submit. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
