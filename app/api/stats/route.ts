import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminEmail } from "@/lib/admin";
import { VERIFY_BANDS, VERIFY_FLAGS, type VerifyStats } from "@/lib/verifyMeta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Protected aggregates for the internal /stats dashboard. Requires a valid
 * Supabase session whose email is in the ADMIN_EMAILS allowlist. Returns only
 * counts — never any per-event detail or content.
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tbl = () => supabaseAdmin.from("verify_events");
  const exact = { count: "exact" as const, head: true };
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [total, passed, web, api, last7d] = await Promise.all([
    tbl().select("*", exact),
    tbl().select("*", exact).eq("passed", true),
    tbl().select("*", exact).eq("source", "web"),
    tbl().select("*", exact).eq("source", "api"),
    tbl().select("*", exact).gt("created_at", weekAgo),
  ]);

  const bandCounts = await Promise.all(
    VERIFY_BANDS.map((b) => tbl().select("*", exact).eq("band", b))
  );
  const flagCounts = await Promise.all(
    VERIFY_FLAGS.map((f) => tbl().select("*", exact).eq("flagged_for", f))
  );

  const bands: Record<string, number> = {};
  VERIFY_BANDS.forEach((b, i) => (bands[b] = bandCounts[i].count ?? 0));
  const flags: Record<string, number> = {};
  VERIFY_FLAGS.forEach((f, i) => (flags[f] = flagCounts[i].count ?? 0));

  const stats: VerifyStats = {
    total: total.count ?? 0,
    passed: passed.count ?? 0,
    web: web.count ?? 0,
    api: api.count ?? 0,
    last7d: last7d.count ?? 0,
    bands,
    flags,
  };

  return NextResponse.json(stats);
}
