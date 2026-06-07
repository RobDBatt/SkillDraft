"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { AgentBadges } from "@/components/AgentTargets";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type PublicSkill = {
  id: string;
  name: string;
  category: string;
  platform: string | null;
  content: string;
  source: "generate" | "improve";
  created_at: string;
  copy_count: number;
  save_count: number;
  agent_targets: string[];
  author_display_name: string | null;
  quality_score: number | null;
  is_official: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  development:         "Development",
  "frontend-design":   "Frontend & Design",
  "content-writing":   "Content Writing",
  "data-integrations": "Data & Integrations",
  "project-workflows": "Project Workflows",
  "custom-other":      "Custom",
};

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label }));

type SortKey = "created_at" | "copy_count" | "save_count";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "created_at",  label: "Recent"      },
  { key: "copy_count",  label: "Most Copied" },
  { key: "save_count",  label: "Most Saved"  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCount(n: number): string {
  if (n === 0) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function ExplorePage() {
  const router = useRouter();
  const [skills,        setSkills]        = useState<PublicSkill[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [category,      setCategory]      = useState<string | null>(null);
  const [sort,          setSort]          = useState<SortKey>("created_at");
  const [expanded,      setExpanded]      = useState<string | null>(null);
  const [copied,        setCopied]        = useState<string | null>(null);
  const [saving,        setSaving]        = useState<string | null>(null);
  const [user,          setUser]          = useState<User | null>(null);
  const [savedSkillIds, setSavedSkillIds] = useState<Set<string>>(new Set());

  // Auth check on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      if (u) {
        // Fetch which community skills this user has already saved
        supabase
          .from("skills")
          .select("saved_from_id")
          .eq("user_id", u.id)
          .not("saved_from_id", "is", null)
          .then(({ data }) => {
            if (data) {
              setSavedSkillIds(new Set(data.map(r => r.saved_from_id as string)));
            }
          });
      }
    });
  }, []);

  const fetchSkills = useCallback(async (q: string, cat: string | null, s: SortKey) => {
    setLoading(true);
    let query = supabase
      .from("skills")
      .select("id, name, category, platform, content, source, created_at, copy_count, save_count, agent_targets, author_display_name, quality_score, is_official")
      .eq("is_public", true)
      .order(s, { ascending: false })
      .limit(60);

    if (cat) query = query.eq("category", cat);
    if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);

    const { data } = await query;
    setSkills((data as PublicSkill[]) ?? []);
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => { fetchSkills("", null, "created_at"); }, [fetchSkills]);

  // Debounced re-fetch on search / filter / sort change
  useEffect(() => {
    const t = setTimeout(() => fetchSkills(search, category, sort), 300);
    return () => clearTimeout(t);
  }, [search, category, sort, fetchSkills]);

  async function handleCopy(skill: PublicSkill) {
    await navigator.clipboard.writeText(skill.content);
    setCopied(skill.id);
    setTimeout(() => setCopied(null), 2000);
    // Fire-and-forget counter increment
    supabase.rpc("increment_copy_count", { p_skill_id: skill.id });
    setSkills(prev =>
      prev.map(s => s.id === skill.id ? { ...s, copy_count: s.copy_count + 1 } : s)
    );
  }

  async function handleSave(skill: PublicSkill) {
    if (!user) {
      router.push("/auth");
      return;
    }
    if (savedSkillIds.has(skill.id) || saving === skill.id) return;
    setSaving(skill.id);

    const { error } = await supabase.from("skills").insert({
      user_id:              user.id,
      name:                 skill.name,
      category:             skill.category,
      platform:             skill.platform,
      content:              skill.content,
      source:               skill.source,
      agent_targets:        skill.agent_targets,
      is_public:            false,
      saved_from_id:        skill.id,
    });

    if (!error) {
      supabase.rpc("record_skill_save", { p_skill_id: skill.id });
      setSavedSkillIds(prev => new Set([...prev, skill.id]));
      setSkills(prev =>
        prev.map(s => s.id === skill.id ? { ...s, save_count: s.save_count + 1 } : s)
      );
    }
    setSaving(null);
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
            SKILL.md files shared by the community. Copy or save any skill directly to your library.
          </p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search skills…"
            className="flex-1 bg-surface border border-border-dark rounded-[4px] px-4 py-2.5 text-silver-mid text-sm focus:outline-none focus:border-silver-dim placeholder:text-silver-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <div className="flex items-center gap-2 shrink-0">
            {SORT_OPTIONS.map(o => (
              <button
                key={o.key}
                type="button"
                onClick={() => setSort(o.key)}
                className={`text-[11px] px-3 py-2.5 rounded-[4px] border motion-safe:transition-colors ${
                  sort === o.key
                    ? "border-amber text-amber"
                    : "border-border-dark text-silver-dim hover:border-silver-faint hover:text-silver-mid"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {o.label}
              </button>
            ))}
          </div>
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
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 rounded-[4px] bg-surface animate-pulse" />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-silver-muted text-sm mb-2">No shared skills yet.</p>
            <p className="text-silver-faint text-xs mb-6">
              {search || category
                ? "Try a different search or filter."
                : "Be the first — generate a skill and share it."}
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
              const isExpanded  = expanded === skill.id;
              const isCopied    = copied   === skill.id;
              const isSaving    = saving   === skill.id;
              const isSaved     = savedSkillIds.has(skill.id);
              const catLabel    = CATEGORY_LABELS[skill.category] ?? skill.category;

              return (
                <div key={skill.id} className="border border-border-dark rounded-[4px] overflow-hidden">

                  {/* Card row */}
                  <div
                    className="px-5 py-4 flex items-start gap-4 flex-wrap"
                    style={{ background: "var(--color-surface)" }}
                  >
                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="text-headline text-sm font-semibold truncate"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {skill.name}
                        </p>
                        {skill.is_official && (
                          <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-amber/15 text-amber border border-amber/30 shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                            ★ Official
                          </span>
                        )}
                        {skill.quality_score != null && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-[2px] border shrink-0 ${
                              skill.quality_score >= 80
                                ? "bg-green-950/40 border-green-900/60 text-green-400"
                                : skill.quality_score >= 60
                                ? "bg-amber/10 border-amber/30 text-amber"
                                : "bg-surface border-border-dark text-silver-dim"
                            }`}
                            style={{ fontFamily: "var(--font-mono)" }}
                            title="Quality score"
                          >
                            {skill.quality_score}/100
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-silver-muted text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                          {catLabel}{skill.platform ? ` · ${skill.platform}` : ""}
                        </span>
                        {skill.author_display_name && (
                          <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                            by {skill.author_display_name}
                          </span>
                        )}
                        <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                          {formatDate(skill.created_at)}
                        </span>
                      </div>

                      {/* Agent badges */}
                      {skill.agent_targets.length > 0 && (
                        <AgentBadges targets={skill.agent_targets} className="mt-2" />
                      )}
                    </div>

                    {/* Engagement counts */}
                    <div className="flex items-center gap-4 text-[11px] text-silver-faint shrink-0 pt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                      <span title="Times copied">{formatCount(skill.copy_count)} copies</span>
                      <span title="Times saved to library">{formatCount(skill.save_count)} saves</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 shrink-0 text-xs w-full sm:w-auto justify-end" style={{ fontFamily: "var(--font-mono)" }}>
                      <button
                        type="button"
                        onClick={() => handleCopy(skill)}
                        className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors focus-visible:outline-none min-w-[46px]"
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
                      <button
                        type="button"
                        onClick={() => handleSave(skill)}
                        disabled={isSaved || isSaving}
                        title={user ? (isSaved ? "Already in your library" : "Save to your library") : "Sign in to save"}
                        className={`motion-safe:transition-colors focus-visible:outline-none disabled:cursor-default min-w-[52px] ${
                          isSaved
                            ? "text-amber"
                            : "text-silver-dim hover:text-silver-mid"
                        }`}
                      >
                        {isSaving ? "…" : isSaved ? "Saved ✓" : "Save"}
                      </button>
                      <Link
                        href={`/improve?from=${skill.id}`}
                        className="text-amber hover:text-amber/80 motion-safe:transition-colors"
                        title="Fork and customise this skill"
                      >
                        Fork →
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
