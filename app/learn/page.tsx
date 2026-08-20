import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { getAllArticles } from "@/lib/learn";

export const metadata: Metadata = {
  title: "Learn — Agent Skills Guides | SkillDraft",
  description:
    "Practical guides to SKILL.md agent skills: GitHub Copilot, Claude Code, Cursor, and the agentskills open standard. Setup paths, frontmatter, triggering, and migration.",
  alternates: { canonical: "https://skilldraft.io/learn" },
};

export default function LearnIndexPage() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-24 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <p
            className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Learn
          </p>
          <h1
            className="text-headline text-3xl font-black leading-tight mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Agent skills, explained properly.
          </h1>
          <p className="text-silver-muted text-sm max-w-2xl">
            Guides to writing, installing, and debugging SKILL.md files across
            GitHub Copilot, Claude Code, Cursor, and every agent that speaks the
            open standard.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/learn/${a.slug}`}
              className="border border-border-dark rounded-[4px] px-5 py-4 hover:border-silver-faint motion-safe:transition-colors block"
              style={{ background: "var(--color-surface)" }}
            >
              <p
                className="text-headline text-sm font-semibold mb-1"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {a.title}
              </p>
              <p className="text-silver-muted text-xs mb-2">{a.description}</p>
              <time
                className="text-silver-faint text-[10px]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {new Date(a.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </Link>
          ))}
        </div>

        <div className="mt-12 border-t border-border-dark pt-8 flex items-center gap-6 flex-wrap">
          <div>
            <p
              className="text-headline text-sm font-semibold mb-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Ready to build one?
            </p>
            <p className="text-silver-muted text-xs">
              The generator creates quality-scored, security-scanned SKILL.md
              files in under 60 seconds.
            </p>
          </div>
          <Link
            href="/generate"
            className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] shrink-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Generate →
          </Link>
        </div>
      </main>
    </div>
  );
}
