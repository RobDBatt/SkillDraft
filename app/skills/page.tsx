"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { supabase, type SkillRow } from "@/lib/supabase";
import { AgentBadges } from "@/components/AgentTargets";

const CATEGORY_LABELS: Record<string, string> = {
  development: "Development",
  "frontend-design": "Frontend & Design",
  "content-writing": "Content Writing",
  "data-integrations": "Data & Integrations",
  "project-workflows": "Project Workflows",
  "custom-other": "Custom",
  improve: "Improved",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/auth");
        return;
      }
      setEmail(user.email ?? null);
      supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single()
        .then(({ data }) => { if (data) setCredits(data.credits); });
      supabase
        .from("skills")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setSkills(data as SkillRow[]);
          setLoading(false);
        });
    });
  }, [router]);

  async function handleDelete(id: string) {
    setDeleting(id);
    await supabase.from("skills").delete().eq("id", id);
    setSkills((prev) => prev.filter((s) => s.id !== id));
    if (expanded === id) setExpanded(null);
    setDeleting(null);
  }

  async function handleCopy(skill: SkillRow) {
    await navigator.clipboard.writeText(skill.content);
    setCopied(skill.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleDownload(skill: SkillRow) {
    const blob = new Blob([skill.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleTogglePublic(skill: SkillRow) {
    setToggling(skill.id);
    const newVal = !skill.is_public;

    // Use the share API so it runs security scan + quality score on publish
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { setToggling(null); return; }

    const res = await fetch(`/api/skills/${skill.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ is_public: newVal }),
    });

    if (res.ok) {
      const body = await res.json().catch(() => ({}));
      setSkills(prev =>
        prev.map(s => s.id === skill.id
          ? {
              ...s,
              is_public: newVal,
              ...(newVal && email ? { author_display_name: email.split("@")[0] } : {}),
              ...(body.quality_score != null ? { quality_score: body.quality_score } : {}),
            }
          : s
        )
      );
    } else if (res.status === 422) {
      const body = await res.json().catch(() => ({}));
      alert(`Security scan failed: ${body.reason ?? "Unknown issue"}\n\nPlease revise the skill before sharing.`);
    }
    setToggling(null);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <SiteNav />
        <main className="flex-1 flex items-center justify-center">
          <p
            className="text-silver-muted text-sm animate-pulse"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Loading your skills…
          </p>
        </main>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (skills.length === 0) {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <SiteNav />
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center">
          <p
            className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            My Skills
          </p>
          <h1
            className="text-headline text-2xl font-black mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            No saved skills yet.
          </h1>
          <p className="text-silver-muted text-sm mb-8 max-w-sm">
            Generate or improve a SKILL.md and hit Save to store it here.
          </p>
          <div className="flex items-center gap-4" style={{ fontFamily: "var(--font-mono)" }}>
            <Link
              href="/generate"
              className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Generate →
            </Link>
            <Link
              href="/improve"
              className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors"
            >
              Improve →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Skills list ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-20 max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              My Skills
            </p>
            <h1
              className="text-headline text-3xl font-black leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {skills.length} saved {skills.length === 1 ? "skill" : "skills"}
            </h1>
          </div>
          <div className="flex items-center gap-5 pt-1" style={{ fontFamily: "var(--font-mono)" }}>
            {credits !== null && (
              <Link href="/pricing" className="text-silver-faint text-[11px] hover:text-silver-dim motion-safe:transition-colors hidden sm:block" style={{ fontFamily: "var(--font-mono)" }}>
                {credits} {credits === 1 ? "credit" : "credits"}
              </Link>
            )}
            {email && (
              <span className="text-silver-faint text-[11px] hidden sm:block">{email}</span>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors focus-visible:outline-none"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-3">
          {skills.map((skill) => {
            const isExpanded = expanded === skill.id;
            const isDeleting = deleting === skill.id;
            const isCopied   = copied   === skill.id;
            const categoryLabel = CATEGORY_LABELS[skill.category] ?? skill.category;

            return (
              <div
                key={skill.id}
                className="border border-border-dark rounded-[4px] overflow-hidden"
              >
                {/* Card header */}
                <div
                  className="px-5 py-4 flex items-center gap-4 flex-wrap"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-headline text-sm font-semibold truncate"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {skill.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span
                        className="text-silver-muted text-[11px]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {categoryLabel}
                        {skill.platform ? ` · ${skill.platform}` : ""}
                      </span>
                      <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                        {skill.source === "improve" ? "improved" : "generated"} · {formatDate(skill.created_at)}
                      </span>
                      {skill.quality_score != null && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-[2px] border ${
                            skill.quality_score >= 80
                              ? "bg-green-950/40 border-green-900/60 text-green-400"
                              : skill.quality_score >= 60
                              ? "bg-amber/10 border-amber/30 text-amber"
                              : "bg-surface border-border-dark text-silver-dim"
                          }`}
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {skill.quality_score}/100
                        </span>
                      )}
                      {skill.saved_from_id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-surface border border-border-dark text-silver-dim" style={{ fontFamily: "var(--font-mono)" }}>
                          community
                        </span>
                      )}
                    </div>
                    {skill.agent_targets && skill.agent_targets.length > 0 && (
                      <AgentBadges targets={skill.agent_targets} className="mt-2" />
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-4 shrink-0 text-xs flex-wrap justify-end"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopy(skill)}
                      className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors focus-visible:outline-none min-w-[42px]"
                    >
                      {isCopied ? "Copied ✓" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(skill)}
                      className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors focus-visible:outline-none"
                    >
                      Download
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
                      onClick={() => handleTogglePublic(skill)}
                      disabled={toggling === skill.id}
                      title={skill.is_public ? "Remove from Explore gallery" : "Share to Explore gallery"}
                      className={`motion-safe:transition-colors focus-visible:outline-none disabled:opacity-40 ${
                        skill.is_public
                          ? "text-amber hover:text-amber/70"
                          : "text-silver-dim hover:text-silver-mid"
                      }`}
                    >
                      {toggling === skill.id ? "…" : skill.is_public ? "Shared ✓" : "Share"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(skill.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-400 motion-safe:transition-colors focus-visible:outline-none disabled:opacity-40"
                    >
                      {isDeleting ? "…" : "Delete"}
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div
                    className="border-t border-border-dark bg-code-bg px-5 py-4 max-h-[480px] overflow-y-auto"
                  >
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

        {/* Footer actions */}
        <div
          className="mt-8 flex items-center gap-5 text-xs"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Link
            href="/generate"
            className="gradient-silver-btn font-semibold px-4 py-2 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Generate new →
          </Link>
          <Link
            href="/improve"
            className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors"
          >
            Improve a skill →
          </Link>
        </div>

      </main>
    </div>
  );
}
