/**
 * GET /api/skills/search
 * Public search endpoint for the CLI.
 * Query params: q (search term), category, platform, limit (default 20)
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const q        = searchParams.get("q")        ?? "";
  const category = searchParams.get("category") ?? "";
  const platform = searchParams.get("platform") ?? "";
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

  let query = supabaseAdmin
    .from("skills")
    .select("id, name, category, platform, quality_score, agent_targets, author_display_name, is_official, copy_count, save_count, created_at")
    .eq("is_public", true)
    .order("quality_score", { ascending: false, nullsFirst: false })
    .order("save_count", { ascending: false })
    .limit(limit);

  if (q.trim())       query = query.ilike("name", `%${q.trim()}%`);
  if (category)       query = query.eq("category", category);
  if (platform)       query = query.contains("agent_targets", [platform]);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [], count: (data ?? []).length });
}
