import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type SkillRow = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  platform: string | null;
  content: string;
  source: "generate" | "improve";
  is_public: boolean;
  copy_count: number;
  save_count: number;
  agent_targets: string[];
  author_display_name: string | null;
  saved_from_id: string | null;
  quality_score: number | null;
  security_flagged: boolean;
  security_flag_reason: string | null;
  is_official: boolean;
  org_id: string | null;
  created_at: string;
};

export function extractSkillName(content: string): string {
  const fm = content.match(/^---\n([\s\S]*?)\n---/m);
  if (fm) {
    const m = fm[1].match(/^name:\s*(.+)$/m);
    if (m) return m[1].trim();
  }
  return "Untitled Skill";
}
