import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Anonymous (logged-out) generation/improvement allowance, shared across both
// routes, keyed by client IP. Persisted in Postgres so it actually holds across
// Vercel serverless instances and cold starts — the previous in-memory Map did
// not (each lambda had its own copy, wiped on recycle).
const RATE_LIMIT = 10;
const WINDOW_SECONDS = 24 * 60 * 60;

// Hard ceiling on total model runs per day across ALL users (anon + logged-in),
// as a backstop against runaway spend. Tune via the DAILY_RUN_CAP env var.
const DEFAULT_DAILY_CAP = 1000;

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  try {
    const { data, error } = await supabaseAdmin.rpc("bump_rate_limit", {
      p_key: `anon:${ip}`,
      p_limit: RATE_LIMIT,
      p_window_seconds: WINDOW_SECONDS,
    });
    if (error) throw error;
    return { allowed: data === true };
  } catch (err) {
    // Fail OPEN: a transient DB error shouldn't lock out legitimate anonymous
    // users. The global daily cap (checkDailyCap) is the real spend backstop.
    console.error("[rateLimit] bump_rate_limit failed, allowing request:", err);
    return { allowed: true };
  }
}

function dailyCap(): number {
  const n = Number.parseInt(process.env.DAILY_RUN_CAP ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_CAP;
}

/**
 * Global daily spend backstop. Counts every run toward a per-day ceiling and
 * returns { allowed: false } once it's reached, so total Anthropic spend can't
 * run away — whether from abuse, a viral spike, or a bug.
 */
export async function checkDailyCap(): Promise<{ allowed: boolean }> {
  try {
    const { data, error } = await supabaseAdmin.rpc("bump_daily_usage", {
      p_cap: dailyCap(),
    });
    if (error) throw error;
    return { allowed: data === true };
  } catch (err) {
    // Fail CLOSED: this is the money backstop. If we can't confirm we're under
    // the cap, don't make paid model calls. (Flip to `allowed: true` if you'd
    // rather prioritize availability over the hard spend guarantee.)
    console.error("[rateLimit] bump_daily_usage failed, blocking request:", err);
    return { allowed: false };
  }
}
