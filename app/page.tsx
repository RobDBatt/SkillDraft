// Layout: sticky nav | hero (grain, 3:2 grid, CLI callout) | trust strip |
// feature cards (quality / security / install) | how it works | explore preview | footer CTA

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ─── Data ──────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  "Claude Code", "Cursor", "Windsurf", "Codex CLI",
  "Gemini CLI", "GitHub Copilot", "ChatGPT",
];

const STEPS = [
  {
    n: "01",
    title: "Choose a category",
    body: "Pick from six workflow types — Development, Frontend, Content, Data, Project, or Custom. Each category has its own question set tailored to that domain.",
  },
  {
    n: "02",
    title: "Pick your AI agent",
    body: "Choose from Claude Code, Cursor, GitHub Copilot, ChatGPT, Windsurf, Codex CLI, Gemini CLI, or Universal. Platform drives the file format, install path, and trigger language.",
  },
  {
    n: "03",
    title: "Answer targeted questions",
    body: "Three to five domain-specific questions. No generic text boxes. The specificity of the questions is what makes the output production-ready.",
  },
  {
    n: "04",
    title: "Watch it generate",
    body: "SkillDraft assembles your skill file in real time via the Anthropic API. Every section — instructions, hard stops, anti-patterns, verification checklist — is built in about 10 seconds.",
  },
  {
    n: "05",
    title: "Install or copy your SKILL.md",
    body: "Drop it in your skills folder, or run npx skilldraft install <id> to auto-detect your agents and write the file to each one.",
  },
];

const FEATURES = [
  {
    icon: "◎",
    title: "Quality scored",
    body: "Every skill is rated 0–100 across seven dimensions: description density, why annotations, when-not-to-use, output template, hard stops, anti-patterns, and verification checklist. Nothing vague ships.",
  },
  {
    icon: "◈",
    title: "Security scanned",
    body: "Skills are checked for prompt injection, dangerous shell commands, data exfiltration patterns, and obfuscation before they're published. Community skills you can actually trust.",
  },
  {
    icon: "◇",
    title: "One-command install",
    body: "The CLI auto-detects which AI agents you have installed and writes the skill file to each one. Claude Code, Cursor, Windsurf, Codex CLI — one command covers all of them.",
  },
];

// ─── Grain texture overlay ─────────────────────────────────────────────────────

function GrainOverlay({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ opacity: 0.055, mixBlendMode: "screen" as const, zIndex: 1 }}
    >
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

// ─── Syntax-highlighted SKILL.md code preview ─────────────────────────────────

function SkillPreview() {
  return (
    <code className="font-mono block whitespace-pre text-[12.5px] leading-[1.7]">
      <span className="text-silver-faint">---{"\n"}</span>
      <span className="text-amber">name</span>
      <span className="text-silver-faint">: </span>
      <span className="text-headline">ts-code-review{"\n"}</span>
      <span className="text-amber">description</span>
      <span className="text-silver-faint">: </span>
      <span className="text-silver-mid">Reviews TypeScript and Next.js{"\n"}</span>
      <span className="text-silver-mid">{"  "}code for type safety, naming{"\n"}</span>
      <span className="text-silver-mid">{"  "}conventions, and project rules.{"\n"}</span>
      <span className="text-silver-mid">{"  "}Use when: "review this", "check PR".{"\n"}</span>
      <span className="text-silver-mid">{"  "}Do not use for greenfield design.{"\n"}</span>
      <span className="text-silver-faint">---{"\n\n"}</span>
      <span className="text-headline font-bold"># TypeScript Code Review{"\n\n"}</span>
      <span className="text-amber">## When NOT to use{"\n"}</span>
      <span className="text-silver-muted">- New files with no existing patterns{"\n"}</span>
      <span className="text-silver-muted">- Architecture decisions (use ADR skill){"\n\n"}</span>
      <span className="text-amber">## Hard stops{"\n"}</span>
      <span className="text-silver-muted">- Never modify </span>
      <span className="text-headline">__tests__/</span>
      <span className="text-silver-muted"> files{"\n"}</span>
      <span className="text-silver-muted">- Never disable TypeScript strict{"\n"}</span>
      <span className="text-silver-muted">- Never commit to main{"\n\n"}</span>
      <span className="text-amber">## Verification checklist{"\n"}</span>
      <span className="text-silver-muted">- [ ] No implicit any introduced{"\n"}</span>
      <span className="text-silver-muted">- [ ] Named exports only in lib/{"\n"}</span>
      <span className="text-silver-muted">- [ ] CC message drafted</span>
    </code>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch a few recent public skills for the Explore preview (server-side)
  const { data: previewSkills } = await supabaseAdmin
    .from("skills")
    .select("id, name, category, author_display_name, quality_score, is_official, copy_count")
    .eq("is_public", true)
    .order("quality_score", { ascending: false, nullsFirst: false })
    .order("save_count", { ascending: false })
    .limit(4);

  const CATEGORY_LABELS: Record<string, string> = {
    development: "Development",
    "frontend-design": "Frontend & Design",
    "content-writing": "Content Writing",
    "data-integrations": "Data & Integrations",
    "project-workflows": "Project Workflows",
    "custom-other": "Custom",
  };

  return (
    <div className="bg-ink">
      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border-dark relative overflow-hidden">
        <GrainOverlay id="hero-grain" />
        {/* Radial glow — subtle depth behind headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center top, rgba(232,200,122,0.05) 0%, transparent 65%)", zIndex: 1 }}
        />
        <div className="max-w-6xl mx-auto px-6 lg:px-16 pt-16 pb-20 lg:pt-24 lg:pb-28 relative" style={{ zIndex: 2 }}>
          <div className="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-start">

            {/* Left — headline + CTA */}
            <div className="flex flex-col gap-8 relative">
              {/* Ghost watermark */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-6 -left-4 text-[10rem] lg:text-[14rem] font-black leading-none select-none"
                style={{ color: "transparent", WebkitTextStroke: "1.5px #1a1d20", fontFamily: "var(--font-serif)", zIndex: 0 }}
              >
                SKILL
              </span>

              <div className="relative flex items-center gap-4" style={{ zIndex: 1 }}>
                <span className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-mono)" }}>
                  SKILL.md generator
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-[2px] border border-green/30 text-green bg-green/5" style={{ fontFamily: "var(--font-mono)" }}>
                  ◈ Security scanned
                </span>
              </div>

              <h1 className="leading-[1.04] tracking-tight relative" style={{ fontFamily: "var(--font-serif)", zIndex: 1 }}>
                <span className="block text-headline text-5xl lg:text-[4.5rem] font-black">Your agent.</span>
                <span className="block text-headline text-5xl lg:text-[4.5rem] font-black">Your rules.</span>
                <span className="block text-silver-muted text-5xl lg:text-[4.5rem] font-black italic">Every session.</span>
              </h1>

              <p className="text-silver-muted text-[1.05rem] leading-[1.75] max-w-[380px]" style={{ fontFamily: "var(--font-sans)" }}>
                Answer a few targeted questions about your workflow.
                Get a production-ready, quality-scored SKILL.md file for every major AI agent.
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href="/generate"
                  className="gradient-silver-btn inline-block text-sm font-semibold px-6 py-3 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Build a Skill →
                </Link>
                <Link href="/explore" className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
                  Browse community →
                </Link>
              </div>

              {/* CLI install */}
              <div className="flex items-center gap-3 pt-1">
                <code className="text-green text-[12px]" style={{ fontFamily: "var(--font-mono)" }}>npx skilldraft install &lt;id&gt;</code>
                <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>— auto-installs to all detected agents</span>
              </div>

              {/* Platform badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {PLATFORMS.map((p) => (
                  <span
                    key={p}
                    className="text-silver-dim text-[10px] border border-[#1e2428] px-2.5 py-1 rounded-[2px] motion-safe:transition-colors motion-safe:duration-150 hover:border-[#2e3438] hover:text-silver-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — SKILL.md code preview */}
            <div className="hidden lg:block mt-2">
              <div className="rounded-[4px] overflow-hidden" style={{ border: "1px solid rgba(245,240,232,0.12)" }}>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "var(--color-code-header)", borderBottom: "1px solid rgba(245,240,232,0.06)" }}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-green flex-shrink-0" aria-hidden="true" />
                    <span className="text-silver-dim text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>SKILL.md</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-green/10 text-green border border-green/20" style={{ fontFamily: "var(--font-mono)" }}>92/100</span>
                </div>
                <div className="bg-code-bg px-5 py-5 overflow-x-auto">
                  <SkillPreview />
                </div>
              </div>
              <p className="text-silver-faint text-[10px] mt-3 pl-1" style={{ fontFamily: "var(--font-mono)" }}>
                Example output · TypeScript / code review · quality scored
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────── */}
      <section className="border-b border-border-dark" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 flex items-center gap-6 lg:gap-10 flex-wrap text-[10px] text-silver-faint overflow-hidden" style={{ fontFamily: "var(--font-mono)" }}>
          <span className="flex items-center gap-2">
            <span className="text-amber">◎</span> Built on Anthropic API
          </span>
          <span className="hidden sm:block text-border-dark2">·</span>
          <span className="flex items-center gap-2">
            <span className="text-green">◈</span> Security scanned before publishing
          </span>
          <span className="hidden sm:block text-border-dark2">·</span>
          <span className="flex items-center gap-2">
            <span className="text-amber">◇</span> Quality scored on 7 dimensions
          </span>
          <span className="hidden sm:block text-border-dark2">·</span>
          <span className="flex items-center gap-2">
            <span className="text-silver-dim">◻</span> agentskills.io open standard
          </span>
          <span className="hidden sm:block text-border-dark2">·</span>
          <Link href="/explore" className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors flex items-center gap-2">
            <span className="text-silver-dim">▸</span> Community skills →
          </Link>
        </div>
      </section>

      {/* ── Feature cards ──────────────────────────────────────────── */}
      <section className="border-b border-border-dark bg-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-24">
          <div className="mb-12">
            <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ fontFamily: "var(--font-mono)" }}>
              Why SkillDraft
            </p>
            <h2 className="text-headline text-3xl lg:text-4xl font-black tracking-tight leading-[1.05]" style={{ fontFamily: "var(--font-serif)" }}>
              Skills that actually work.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-px border border-border-dark rounded-[4px] overflow-hidden" style={{ background: "var(--color-border-dark)" }}>
            {FEATURES.map(f => (
              <div key={f.title} className="flex flex-col gap-4 p-7 group hover:bg-[#0d1014] motion-safe:transition-colors" style={{ background: "var(--color-surface)" }}>
                <span className="text-amber text-xl" style={{ fontFamily: "var(--font-mono)" }}>{f.icon}</span>
                <h3 className="text-headline text-base font-bold" style={{ fontFamily: "var(--font-serif)" }}>{f.title}</h3>
                <p className="text-silver-muted text-sm leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{f.body}</p>
              </div>
            ))}
          </div>

          {/* CLI callout */}
          <div className="mt-8 border border-border-dark rounded-[4px] px-6 py-5 flex items-center gap-6 flex-wrap" style={{ background: "var(--color-surface)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-silver-mid text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-mono)" }}>Install any community skill in one command</p>
              <p className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-sans)" }}>
                Auto-detects Claude Code, Cursor, Windsurf, Codex CLI, and Gemini CLI — writes the file to each agent directory automatically.
              </p>
            </div>
            <code className="text-green text-sm shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
              npx skilldraft install &lt;skill-id&gt;
            </code>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border-dark">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-24">
          <div className="mb-16">
            <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ fontFamily: "var(--font-mono)" }}>
              The process
            </p>
            <h2 className="text-headline text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
              How it works.
            </h2>
            <p className="text-silver-muted text-[0.95rem] leading-relaxed max-w-md" style={{ fontFamily: "var(--font-sans)" }}>
              Five steps. Under two minutes. The specificity of the questions is what separates production-ready output from generic boilerplate.
            </p>
          </div>

          <div className="divide-y divide-border-dark">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="group relative -mx-4 px-4 py-10 grid sm:grid-cols-[72px_1fr] gap-4 sm:gap-10 items-start motion-safe:transition-colors motion-safe:duration-200 hover:bg-[#0c0e10]"
              >
                <span aria-hidden="true" className="absolute left-0 inset-y-0 w-[2px] rounded-full bg-amber opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-200" />
                <span className="text-amber text-5xl font-black leading-none motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-[1.06]" style={{ fontFamily: "var(--font-serif)" }}>
                  {step.n}
                </span>
                <div>
                  <h3 className="text-headline text-xl lg:text-2xl font-bold mb-2.5" style={{ fontFamily: "var(--font-serif)" }}>
                    {step.title}
                  </h3>
                  <p className="text-silver-muted text-[0.95rem] leading-[1.7] max-w-lg motion-safe:transition-colors motion-safe:duration-200 group-hover:text-silver-mid" style={{ fontFamily: "var(--font-sans)" }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore preview ─────────────────────────────────────────── */}
      {previewSkills && previewSkills.length > 0 && (
        <section className="border-b border-border-dark bg-ink">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-24">
            <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
              <div>
                <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ fontFamily: "var(--font-mono)" }}>
                  Community
                </p>
                <h2 className="text-headline text-3xl lg:text-4xl font-black tracking-tight leading-[1.05]" style={{ fontFamily: "var(--font-serif)" }}>
                  Skills built by developers.
                </h2>
              </div>
              <Link href="/explore" className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                Browse all skills →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {previewSkills.map(skill => (
                <Link
                  key={skill.id}
                  href={`/explore`}
                  className="border border-border-dark rounded-[4px] p-4 flex flex-col gap-3 hover:border-silver-faint motion-safe:transition-colors"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-headline text-[13px] font-semibold leading-snug flex-1" style={{ fontFamily: "var(--font-sans)" }}>
                      {skill.name}
                    </p>
                    {skill.is_official && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] bg-amber/15 text-amber border border-amber/30 shrink-0" style={{ fontFamily: "var(--font-mono)" }}>★</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto flex-wrap">
                    <span className="text-silver-faint text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {CATEGORY_LABELS[skill.category] ?? skill.category}
                    </span>
                    {skill.quality_score != null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-[2px] border ml-auto ${
                          skill.quality_score >= 80
                            ? "bg-green-950/40 border-green-900/60 text-green-400"
                            : skill.quality_score >= 60
                            ? "bg-amber/10 border-amber/30 text-amber"
                            : "border-border-dark text-silver-dim"
                        }`}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {skill.quality_score}/100
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-5" style={{ fontFamily: "var(--font-mono)" }}>
              <Link href="/explore" className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] motion-safe:transition-all hover:scale-[1.02] active:scale-[0.98]">
                Browse all skills →
              </Link>
              <Link href="/collections" className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors">
                View collections →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <footer className="border-t border-border-dark relative overflow-hidden">
        <GrainOverlay id="footer-grain" />
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-16 relative" style={{ zIndex: 2 }}>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-16 items-start">

            {/* Left — headline + CTA */}
            <div>
              <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-6" style={{ fontFamily: "var(--font-mono)" }}>
                Get started
              </p>
              <h2 className="text-headline text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] mb-5" style={{ fontFamily: "var(--font-serif)" }}>
                Stop re-explaining yourself<br />to your agent.
              </h2>
              <p className="text-silver-muted text-[0.95rem] leading-relaxed mb-10 max-w-sm" style={{ fontFamily: "var(--font-sans)" }}>
                Build a SKILL.md in under two minutes. Free, no login required. Save and share with an account.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/generate"
                  className="gradient-silver-btn inline-block text-sm font-semibold px-6 py-3 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Build a Skill →
                </Link>
                <Link href="/explore" className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
                  Browse skills →
                </Link>
              </div>
            </div>

            {/* Right — nav links grid */}
            <div className="hidden lg:grid grid-cols-2 gap-x-8 gap-y-1 pt-1" style={{ fontFamily: "var(--font-mono)" }}>
              {[
                { label: "Generate",    href: "/generate"   },
                { label: "Improve",     href: "/improve"    },
                { label: "Explore",     href: "/explore"    },
                { label: "Collections", href: "/collections"},
                { label: "My Skills",   href: "/skills"     },
                { label: "Teams",       href: "/teams"      },
                { label: "Pricing",     href: "/pricing"    },
                { label: "Install",     href: "/install"    },
                { label: "FAQ",         href: "/faq"        },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-silver-faint hover:text-silver-mid text-xs py-1.5 motion-safe:transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

          </div>

          {/* Footer bar */}
          <div className="mt-20 pt-6 border-t border-[#141618] flex items-center justify-between flex-wrap gap-4">
            <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
              © 2026 SkillDraft.io
            </span>
            <div className="flex items-center gap-6 text-[11px] text-silver-faint" style={{ fontFamily: "var(--font-mono)" }}>
              <Link href="/explore" className="hover:text-silver-dim motion-safe:transition-colors">Community skills</Link>
              <span>agentskills.io standard</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
