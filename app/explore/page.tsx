"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";

type PublicSkill = {
  id: string;
  name: string;
  category: string;
  platform: string | null;
  content: string;
  source: "generate" | "improve";
  created_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  development:        "Development",
  "frontend-design":  "Frontend & Design",
  "content-writing":  "Content Writing",
  "data-integrations":"Data & Integrations",
  "project-workflows":"Project Workflows",
  "custom-other":     "Custom",
};

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label }));

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ExplorePage() {
  const [skills,    setSkills]    = useState<PublicSkill[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState<string | null>(null);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [copied,    setCopied]    = useState<string | null>(null);

  const fetchSkills = useCallback(async (q: string, cat: string | null) => {
    setLoading(true);
    let query = supabase
      .from("skills")
      .select("id, name, category, platform, content, source, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(60);

    if (cat) query = query.eq("category", cat);
    if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);

    const { data } = await query;
    setSkills((data as PublicSkill[]) ?? []);
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => { fetchSkills("", null); }, [fetchSkills]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchSkills(search, category), 300);
    return () => clearTimeout(t);
  }, [search, category, fetchSkills]);

  async function handleCopy(skill: PublicSkill) {
    await navigator.clipboard.writeText(skill.content);
    setCopied(skill.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-24 max-w-6xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8">
          <p
            className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Community
          </p>
          <h1
            className="text-headline text-3xl font-black leading-tight mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Explore shared skills
          </h1>
          <p className="text-silver-muted text-sm">
            SKILL.md files shared by the community. Copy any skill directly to your AI agent.
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search skills…"
            className="flex-1 bg-surface border border-border-dark rounded-[4px] px-4 py-2.5 text-silver-mid text-sm focus:outline-none focus:border-silver-dim placeholder:text-silver-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`text-[11px] px-3 py-1 rounded-[3px] border motion-safe:transition-colors ${
              category === null
                ? "border-amber text-amber"
                : "border-border-dark text-silver-dim hover:border-silver-faint hover:text-silver-mid"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(category === c.id ? null : c.id)}
              className={`text-[11px] px-3 py-1 rounded-[3px] border motion-safe:transition-colors ${
                category === c.id
                  ? "border-amber text-amber"
                  : "border-border-dark text-silver-dim hover:border-silver-faint hover:text-silver-mid"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 rounded-[4px] bg-surface animate-pulse" />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-silver-muted text-sm mb-2">No shared skills yet.</p>
            <p className="text-silver-faint text-xs mb-6">
              {search || category ? "Try a different search or filter." : "Be the first — generate a skill and share it."}
            </p>
            <Link
              href="/generate"
              className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Generate a skill →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-silver-faint text-[11px] mb-1" style={{ fontFamily: "var(--font-mono)" }}>
              {skills.length} {skills.length === 1 ? "skill" : "skills"} found
            </p>
            {skills.map(skill => {
              const isExpanded = expanded === skill.id;
              const isCopied   = copied   === skill.id;
              const catLabel   = CATEGORY_LABELS[skill.category] ?? skill.category;

              return (
                <div key={skill.id} className="border border-border-dark rounded-[4px] overflow-hidden">
                  {/* Card row */}
                  <div className="px-5 py-4 flex items-center gap-4 flex-wrap" style={{ background: "var(--color-surface)" }}>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-headline text-sm font-semibold truncate"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {skill.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-silver-muted text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                          {catLabel}{skill.platform ? ` · ${skill.platform}` : ""}
                        </span>
                        <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                          {skill.source === "improve" ? "improved" : "generated"} · {formatDate(skill.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                      <button
                        type="button"
                        onClick={() => handleCopy(skill)}
                        className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors focus-visible:outline-none min-w-[42px]"
                      >
                        {isCopied ? "Copied ✓" : "Copy"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : skill.id)}
                        className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors focus-visible:outline-none"
                      >
                        {isExpanded ? "Collapse" : "View"}
                      </button>
                      <Link
                        href="/generate"
                        className="text-amber hover:text-amber/80 motion-safe:transition-colors"
                      >
                        Make mine →
                      </Link>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-border-dark bg-code-bg px-5 py-4 max-h-[480px] overflow-y-auto">
                      <pre
                        className="text-silver-mid text-[12px] leading-[1.75] whitespace-pre"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {skill.content}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
