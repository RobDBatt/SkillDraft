import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Explore Skills — SkillDraft",
  description:
    "Browse community-shared SKILL.md files. Find skills for development, frontend, content writing, data integrations, and more — copy any skill directly to your AI agent.",
  alternates: { canonical: "https://skilldraft.io/explore" },
  openGraph: {
    title: "Explore Skills — SkillDraft",
    description:
      "Browse community-shared SKILL.md files. Find skills for development, frontend, content writing, data integrations, and more.",
    url: "https://skilldraft.io/explore",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Explore Skills — SkillDraft",
    description:
      "Browse community-shared SKILL.md files. Copy any skill directly to your AI agent.",
  },
};

// Server-rendered links to every category and platform page. The explore
// browser itself is a client component that filters with state (no <a> tags),
// which left /explore/c/* and /explore/for/* with zero incoming internal
// links — they were in the sitemap but orphaned for crawlers.
const BROWSE_CATEGORIES: { slug: string; label: string }[] = [
  { slug: "development", label: "Development" },
  { slug: "frontend-design", label: "Frontend & Design" },
  { slug: "content-writing", label: "Content Writing" },
  { slug: "data-integrations", label: "Data & Integrations" },
  { slug: "project-workflows", label: "Project Workflows" },
  { slug: "devops-infrastructure", label: "DevOps & Infrastructure" },
  { slug: "security", label: "Security" },
  { slug: "backend-frameworks", label: "Backend Frameworks" },
  { slug: "git-version-control", label: "Git & PR Workflows" },
  { slug: "database-sql", label: "Database & SQL" },
  { slug: "custom-other", label: "Custom" },
];

const BROWSE_PLATFORMS: { slug: string; label: string }[] = [
  { slug: "claude-code", label: "Claude Code" },
  { slug: "cursor", label: "Cursor" },
  { slug: "windsurf", label: "Windsurf" },
  { slug: "codex", label: "Codex CLI" },
  { slug: "gemini-cli", label: "Gemini CLI" },
  { slug: "github-copilot", label: "GitHub Copilot" },
];

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section className="bg-ink px-6 lg:px-10 pb-16">
        <div className="max-w-6xl mx-auto w-full border-t border-white/10 pt-10">
          <nav aria-label="Browse skills by category">
            <h2
              className="text-[11px] uppercase tracking-widest text-silver-faint mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Browse by category
            </h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-silver-dim">
              {BROWSE_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/explore/c/${c.slug}`}
                    className="hover:text-silver-mid motion-safe:transition-colors"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Browse skills by platform" className="mt-6">
            <h2
              className="text-[11px] uppercase tracking-widest text-silver-faint mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Browse by platform
            </h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-silver-dim">
              {BROWSE_PLATFORMS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/explore/for/${p.slug}`}
                    className="hover:text-silver-mid motion-safe:transition-colors"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
