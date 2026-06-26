import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { supabaseAdmin, safeSelect } from "@/lib/supabase-admin";
import { AgentBadges } from "@/components/AgentTargets";

// ISR: rebuild hourly so newly shared/official skills appear without a redeploy.
export const revalidate = 3600;

const CATEGORY_META: Record<string, { label: string; headline: string; description: string }> = {
  development: {
    label: "Development",
    headline: "Software Development Skills",
    description: "SKILL.md files for code review, test writing, scaffolding, refactoring, and git workflows. Install any skill into Claude Code, Cursor, or Windsurf.",
  },
  "frontend-design": {
    label: "Frontend & Design",
    headline: "Frontend & Design Skills",
    description: "UI component builders, design system skills, and layout patterns. Tailwind, React, Radix, and more — install directly into your AI coding agent.",
  },
  "content-writing": {
    label: "Content Writing",
    headline: "Content Writing Skills",
    description: "Copywriting, technical documentation, SEO content, and editorial skills for AI agents. Define voice, tone, and format rules once — apply everywhere.",
  },
  "data-integrations": {
    label: "Data & Integrations",
    headline: "Data & Integration Skills",
    description: "ETL pipelines, API integrations, PostgreSQL queries, and data transformation skills. Tell your AI agent exactly how to handle your data contracts.",
  },
  "project-workflows": {
    label: "Project Workflows",
    headline: "Project Workflow Skills",
    description: "Feature specs, PR workflows, deployment checklists, and development lifecycle management skills for AI coding agents.",
  },
  "devops-infrastructure": {
    label: "DevOps & Infrastructure",
    headline: "DevOps & Infrastructure Skills",
    description: "CI/CD pipelines, Terraform modules, Kubernetes manifests, incident runbooks, and deployment automation skills. Install into Claude Code, Cursor, or Windsurf.",
  },
  security: {
    label: "Security",
    headline: "Security Skills",
    description: "Secure coding, OWASP Top 10 audits, input validation, secret detection, and dependency scanning skills for AI coding agents.",
  },
  "backend-frameworks": {
    label: "Backend Frameworks",
    headline: "Backend Framework Skills",
    description: "FastAPI, Django, Rails, Laravel, NestJS, and Go REST skills — idiomatic endpoints, migrations, service layers, and test patterns for every major backend.",
  },
  "git-version-control": {
    label: "Git & PR Workflows",
    headline: "Git & PR Workflow Skills",
    description: "Commit-message, pull-request, code-review, branching, and changelog skills that enforce your team's git conventions. Conventional Commits, trunk-based, Git Flow — install into Claude Code, Cursor, or Windsurf.",
  },
  "database-sql": {
    label: "Database & SQL",
    headline: "Database & SQL Skills",
    description: "Query optimisation, schema design, migration, and indexing skills for PostgreSQL, MySQL, SQL Server, and more — with parameterised-query and reversible-migration guardrails baked in.",
  },
  "custom-other": {
    label: "Custom",
    headline: "Custom Skills",
    description: "Community-built SKILL.md files for specialized workflows that don't fit a standard category. Browse, copy, or generate your own.",
  },
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_META).map(category => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) return {};
  return {
    title: `${meta.headline} — SkillDraft`,
    description: meta.description,
    openGraph: { title: `${meta.headline} — SkillDraft`, description: meta.description, url: `https://skilldraft.io/explore/c/${category}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) notFound();

  const skills = await safeSelect(() =>
    supabaseAdmin
      .from("skills")
      .select("id, name, category, platform, agent_targets, author_display_name, quality_score, copy_count, save_count, is_official, created_at")
      .eq("is_public", true)
      .eq("category", category)
      .order("quality_score", { ascending: false, nullsFirst: false })
      .order("save_count", { ascending: false })
      .limit(24)
  );

  const list = skills ?? [];

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-24 max-w-6xl mx-auto w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-silver-faint mb-6" style={{ fontFamily: "var(--font-mono)" }}>
          <Link href="/explore" className="hover:text-silver-dim motion-safe:transition-colors">Explore</Link>
          <span>/</span>
          <span className="text-silver-mid">{meta.label}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ fontFamily: "var(--font-mono)" }}>
            Category
          </p>
          <h1 className="text-headline text-3xl font-black leading-tight mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            {meta.headline}
          </h1>
          <p className="text-silver-muted text-sm max-w-2xl">{meta.description}</p>
        </div>

        {/* Skills grid */}
        {list.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-silver-muted text-sm mb-4">No shared {meta.label.toLowerCase()} skills yet.</p>
            <Link href="/generate" className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px]" style={{ fontFamily: "var(--font-mono)" }}>
              Generate the first one →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-silver-faint text-[11px] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
              {list.length} {list.length === 1 ? "skill" : "skills"} · sorted by quality
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
                    {skill.author_display_name && (
                      <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>by {skill.author_display_name}</span>
                    )}
                    <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {skill.copy_count} copies · {skill.save_count} saves
                    </span>
                    {skill.quality_score != null && (
                      <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                        Quality: {skill.quality_score}/100
                      </span>
                    )}
                  </div>
                  {skill.agent_targets?.length > 0 && (
                    <AgentBadges targets={skill.agent_targets} className="mt-2" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                  <Link href={`/explore?id=${skill.id}`} className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors">View</Link>
                  <Link href="/generate" className="text-amber hover:text-amber/80 motion-safe:transition-colors">Make mine →</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 border-t border-border-dark pt-8 flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-headline text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-sans)" }}>
              Need a custom {meta.label.toLowerCase()} skill?
            </p>
            <p className="text-silver-muted text-xs">Generate one tailored to your exact stack and conventions.</p>
          </div>
          <Link href="/generate" className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
            Generate →
          </Link>
        </div>

        {/* Install CTA */}
        <div className="mt-8 border border-border-dark rounded-[4px] px-5 py-4 flex items-start gap-4 flex-wrap" style={{ background: "var(--color-surface)" }}>
          <div className="flex-1 min-w-0">
            <p className="text-silver-mid text-xs font-semibold mb-1" style={{ fontFamily: "var(--font-mono)" }}>Install any skill in one command</p>
            <code className="text-green text-[12px]" style={{ fontFamily: "var(--font-mono)" }}>npx skilldraft install &lt;skill-id&gt;</code>
          </div>
          <Link href="/explore" className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors shrink-0 pt-1" style={{ fontFamily: "var(--font-mono)" }}>
            Browse all →
          </Link>
        </div>

      </main>
    </div>
  );
}
