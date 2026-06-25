"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { AgentBadges } from "@/components/AgentTargets";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_official: boolean;
  is_public: boolean;
};

type CollectionSkill = {
  skill_id: string;
  position: number;
  skills: {
    id: string;
    name: string;
    category: string;
    agent_targets: string[];
    quality_score: number | null;
    copy_count: number;
    save_count: number;
    author_display_name: string | null;
    content: string;
  };
};

const CATEGORY_LABELS: Record<string, string> = {
  development: "Development", "frontend-design": "Frontend & Design",
  "content-writing": "Content Writing", "data-integrations": "Data & Integrations",
  "project-workflows": "Project Workflows", "devops-infrastructure": "DevOps & Infrastructure",
  security: "Security", "backend-frameworks": "Backend Frameworks",
  "git-version-control": "Git & PR Workflows", "database-sql": "Database & SQL",
  "custom-other": "Custom",
};

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [skills,     setSkills]     = useState<CollectionSkill[]>([]);
  const [user,       setUser]       = useState<User | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [copied,     setCopied]     = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    (async () => {
      const { data: col } = await supabase.from("collections").select("*").eq("id", id).single();
      if (!col) { router.replace("/collections"); return; }
      setCollection(col as Collection);

      const { data: cs } = await supabase
        .from("collection_skills")
        .select("skill_id, position, skills(id, name, category, agent_targets, quality_score, copy_count, save_count, author_display_name, content)")
        .eq("collection_id", id)
        .order("position");
      setSkills((cs as unknown as CollectionSkill[]) ?? []);
      setLoading(false);
    })();
  }, [id, router]);

  async function handleCopy(content: string, skillId: string) {
    await navigator.clipboard.writeText(content);
    setCopied(skillId);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleTogglePublic() {
    if (!collection || !user || user.id !== collection.user_id) return;
    const newVal = !collection.is_public;
    await supabase.from("collections").update({ is_public: newVal }).eq("id", id);
    setCollection(prev => prev ? { ...prev, is_public: newVal } : prev);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <SiteNav />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-silver-muted text-sm animate-pulse" style={{ fontFamily: "var(--font-mono)" }}>Loading…</p>
        </main>
      </div>
    );
  }

  if (!collection) return null;
  const isOwner = user?.id === collection.user_id;

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-24 max-w-6xl mx-auto w-full">

        <nav className="flex items-center gap-2 text-[11px] text-silver-faint mb-6" style={{ fontFamily: "var(--font-mono)" }}>
          <Link href="/collections" className="hover:text-silver-dim motion-safe:transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-silver-mid">{collection.name}</span>
        </nav>

        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-mono)" }}>
                Collection
              </p>
              {collection.is_official && (
                <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-amber/15 text-amber border border-amber/30" style={{ fontFamily: "var(--font-mono)" }}>
                  ★ Official
                </span>
              )}
            </div>
            <h1 className="text-headline text-3xl font-black leading-tight mb-2" style={{ fontFamily: "var(--font-serif)" }}>
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-silver-muted text-sm max-w-2xl">{collection.description}</p>
            )}
          </div>

          {isOwner && (
            <div className="flex items-center gap-4 text-xs shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
              <button
                type="button"
                onClick={handleTogglePublic}
                className={`motion-safe:transition-colors ${collection.is_public ? "text-amber" : "text-silver-dim hover:text-silver-mid"}`}
              >
                {collection.is_public ? "Public ✓" : "Make public"}
              </button>
            </div>
          )}
        </div>

        {/* Install all command */}
        {skills.length > 0 && (
          <div className="border border-border-dark rounded-[4px] px-5 py-4 mb-8 flex items-center gap-4" style={{ background: "var(--color-surface)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-silver-faint text-[11px] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Install all {skills.length} skills</p>
              <code className="text-green text-[12px]" style={{ fontFamily: "var(--font-mono)" }}>
                {skills.map(cs => `npx skilldraft install ${cs.skills.id.slice(0, 8)}`).join(" && ")}
              </code>
            </div>
          </div>
        )}

        {/* Skills list */}
        {skills.length === 0 ? (
          <div className="text-center py-16 border border-border-dark rounded-[4px]">
            <p className="text-silver-muted text-sm mb-2">No skills in this collection yet.</p>
            {isOwner && (
              <p className="text-silver-faint text-xs">Go to your library and add skills to this collection.</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-silver-faint text-[11px] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
              {skills.length} {skills.length === 1 ? "skill" : "skills"}
            </p>
            {skills.map(({ skills: skill }) => (
              <div key={skill.id} className="border border-border-dark rounded-[4px] px-5 py-4 flex items-center gap-4 flex-wrap" style={{ background: "var(--color-surface)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-headline text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>{skill.name}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-silver-muted text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {CATEGORY_LABELS[skill.category] ?? skill.category}
                    </span>
                    {skill.quality_score != null && (
                      <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                        {skill.quality_score}/100
                      </span>
                    )}
                    <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {skill.copy_count} copies
                    </span>
                  </div>
                  {skill.agent_targets?.length > 0 && <AgentBadges targets={skill.agent_targets} className="mt-2" />}
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(skill.content, skill.id)}
                    className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors min-w-[46px]"
                  >
                    {copied === skill.id ? "Copied ✓" : "Copy"}
                  </button>
                  <code className="text-silver-faint text-[10px] hidden sm:block">
                    npx skilldraft install {skill.id.slice(0, 8)}…
                  </code>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
