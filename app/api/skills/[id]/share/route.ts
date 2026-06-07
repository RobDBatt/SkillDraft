/**
 * POST /api/skills/[id]/share
 * Auth-required. Runs security scan, then sets is_public + author_display_name.
 * Replaces the direct Supabase client-side update so we can enforce server-side scanning.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { scanSecurity } from "@/lib/scanSecurity";
import { scoreSkill } from "@/lib/scoreSkill";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid token." }, { status: 401 });

  // Verify ownership
  const { data: skill } = await supabaseAdmin
    .from("skills")
    .select("id, content, is_public, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!skill) return NextResponse.json({ error: "Skill not found." }, { status: 404 });

  let body: { is_public: boolean; author_display_name?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // If sharing (turning public ON), run security scan
  if (body.is_public && !skill.is_public) {
    const scan = scanSecurity(skill.content);
    if (!scan.passed) {
      return NextResponse.json({
        error: `Security check failed: ${scan.reason}`,
        securityFailed: true,
        reason: scan.reason,
      }, { status: 422 });
    }

    // Compute quality score
    const { score } = scoreSkill(skill.content);

    await supabaseAdmin
      .from("skills")
      .update({
        is_public: true,
        author_display_name: body.author_display_name ?? null,
        security_flagged: false,
        security_flag_reason: null,
        quality_score: score,
      })
      .eq("id", id);

    return NextResponse.json({ success: true, quality_score: score });
  }

  // Unsharing — no scan needed
  await supabaseAdmin
    .from("skills")
    .update({ is_public: body.is_public })
    .eq("id", id);

  return NextResponse.json({ success: true });
}
