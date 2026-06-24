import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { supabaseAdmin, safeSelect } from "@/lib/supabase-admin";
import { AgentBadges } from "@/components/AgentTargets";

const PLATFORM_META: Record<string, { label: string; headline: string; description: string; agentId: string }> = {
  "claude-code": {
    label: "Claude Code",
    headline: "Claude Code Skills",
    description: "Community SKILL.md files optimized for Claude Code. Install specialized skills for React, TypeScript, Python, testing, and more — one command.",
    agentId: "claude-code",
  },
  cursor: {
    label: "Cursor",
    headline: "Cursor Skills",
    description: "SKILL.md files and rules for Cursor. Coding conventions, component builders, and workflow rules — install any skill directly into your Cursor workspace.",
    agentId: "cursor",
  },
  windsurf: {
    label: "Windsurf",
    headline: "Windsurf Skills",
    description: "SKILL.md files built for Windsurf. Domain-specific skills covering development workflows, code review, and architecture rules.",
    agentId: "windsurf",
  },
  codex: {
    label: "Codex CLI",
    headline: "Codex CLI Skills",
    description: "SKILL.md files compatible with Codex CLI. Install coding skills, workflow automation, and domain-specific rules for OpenAI's coding agent.",
    agentId: "codex-cli",
  },
  "gemini-cli": {
    label: "Gemini CLI",
    headline: "Gemini CLI Skills",
    description: "Agent skills built for Gemini CLI. Compatible with the agentskills.io open standard — install once, use across coding sessions.",
    agentId: "gemini-cli",
  },
};

export async function generateStaticParams() {
  return Object.keys(PLATFORM_META).map(platform => ({ platform }));
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }): Promise<Metadata> {
  const { platform } = await params;
  const meta = PLATFORM_META[platform];
  if (!meta) return {};
  return {
    title: `${meta.headline} — SkillDraft`,
    description: meta.description,
    openGraph: { title: `${meta.headline} — SkillDraft`, description: meta.description, url: `https://skilldraft.io/explore/for/${platform}` },
  };
}

export default async function PlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const meta = PLATFORM_META[platform];
  if (!meta) notFound();

  const skills = await safeSelect(() =>
    supabaseAdmin
      .from("skills")
      .select("id, name, category, platform, agent_targets, author_display_name, quality_score, copy_count, save_count, is_official, created_at")
      .eq("is_public", true)
      .contains("agent_targets", [meta.agentId])
      .order("quality_score", { ascending: false, nullsFirst: false })
      .order("save_count", { ascending: false })
      .limit(24)
  );

  const list = skills ?? [];

  const CATEGORY_LABELS: Record<string, string> = {
    development: "Development", "frontend-design": "Frontend & Design",
    "content-writing": "Content Writing", "data-integrations": "Data & Integrations",
    "project-workflows": "Project Workflows", "custom-other": "Custom",
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-24 max-w-6xl mx-auto w-full">

        <nav className="flex items-center gap-2 text-[11px] text-silver-faint mb-6" style={{ fontFamily: "var(--font-mono)" }}>
          <Link href="/explore" className="hover:text-silver-dim motion-safe:transition-colors">Explore</Link>
          <span>/</span>
          <span className="text-silver-mid">{meta.label}</span>
        </nav>

        <div className="mb-8">
          <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ fontFamily: "var(--font-mono)" }}>
            Agent Platform
          </p>
          <h1 className="text-headline text-3xl font-black leading-tight mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            {meta.headline}
          </h1>
          <p className="text-silver-muted text-sm max-w-2xl">{meta.description}</p>
        </div>

        {/* Install command */}
        <div className="border border-border-dark rounded-[4px] px-5 py-4 mb-8 flex items-center gap-4 flex-wrap" style={{ background: "var(--color-surface)" }}>
          <code className="text-green text-[12px] flex-1" style={{ fontFamily: "var(--font-mono)" }}>
            npx skilldraft install &lt;skill-id&gt;
          </code>
          <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
            Auto-installs to {meta.label}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-silver-muted text-sm mb-4">No {meta.label} skills shared yet.</p>
            <Link href="/generate" className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px]" style={{ fontFamily: "var(--font-mono)" }}>
              Generate the first one →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-silver-faint text-[11px] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
              {list.length} {meta.label} {list.length === 1 ? "skill" : "skills"}
            </p>
            {list.map(skill => (
              <div key={skill.id} className="border border-border-dark rounded-[4px] px-5 py-4 flex items-center gap-4 flex-wrap" style={{ background: "var(--color-surface)" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-headline text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>{skill.name}</p>
                    {skill.is_official && (
                      <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-amber/15 text-amber border border-amber/30" style={{ fontFamily: "var(--font-mono)" }}>
                        ★ Official
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-silver-muted text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {CATEGORY_LABELS[skill.category] ?? skill.category}
                    </span>
                    {skill.author_display_name && (
                      <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>by {skill.author_display_name}</span>
                    )}
                    <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {skill.copy_count} copies · {skill.save_count} saves
                      {skill.quality_score != null ? ` · ${skill.quality_score}/100` : ""}
                    </span>
                  </div>
                  {skill.agent_targets?.length > 0 && <AgentBadges targets={skill.agent_targets} className="mt-2" />}
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                  <code className="text-silver-faint text-[10px] hidden sm:block">npx skilldraft install {skill.id.slice(0, 8)}…</code>
                  <Link href="/generate" className="text-amber hover:text-amber/80 motion-safe:transition-colors">Make mine →</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 border-t border-border-dark pt-8 flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-headline text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-sans)" }}>
              Need a custom {meta.label} skill?
            </p>
            <p className="text-silver-muted text-xs">The generator creates properly structured SKILL.md files in under 60 seconds.</p>
          </div>
          <Link href="/generate" className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
            Generate →
          </Link>
        </div>

      </main>
    </div>
  );
}
