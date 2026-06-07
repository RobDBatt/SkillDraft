/**
 * GET /api/skills/[id]
 * Public endpoint — returns raw SKILL.md content for the CLI installer.
 * Only works for is_public = true skills.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("skills")
    .select("id, name, category, platform, content, quality_score, agent_targets, author_display_name, is_official, copy_count, save_count")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Skill not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}
