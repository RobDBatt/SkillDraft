// Layout: sticky nav (backdrop-blur) | dark hero (asymmetric 3:2, grain overlay) |
// surface how-it-works (editorial rows + hover accent) | dark CTA footer (left + stats)
// Visual anchor: hero → code preview | how-it-works → amber step numbers | footer → headline

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

// ─── Data ──────────────────────────────────────────────────────────────────────

const PLATFORMS = ["Claude Code", "Cursor", "GitHub Copilot", "ChatGPT", "Windsurf", "Codex CLI", "Gemini CLI"];

const STEPS = [
  {
    n: "01",
    title: "Choose a category",
    body: "Pick from six workflow types — Development, Frontend, Content, Data, Project, or Custom. Each route has its own question set tailored to that domain.",
  },
  {
    n: "02",
    title: "Pick your AI agent",
    body: "Choose from Claude Code, Cursor, GitHub Copilot, ChatGPT, Windsurf, Codex CLI, Gemini CLI, or Universal. Platform drives the file format, install path, and trigger language.",
  },
  {
    n: "03",
    title: "Answer targeted questions",
    body: "Three to five questions specific to your category. No generic text boxes. The specificity of the questions is what makes the output production-ready.",
  },
  {
    n: "04",
    title: "Watch it generate",
    body: "SkillDraft calls the Anthropic API and assembles your skill file in real time. Takes about 10 seconds.",
  },
  {
    n: "05",
    title: "Copy or download your SKILL.md",
    body: "Drop it in your .claude/skills/ folder and the agent knows exactly what to do — and what never to do.",
  },
];

const STATS = [
  { value: "6", label: "skill categories" },
  { value: "8", label: "AI platforms" },
  { value: "< 2 min", label: "start to finish" },
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
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
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
      <span className="text-silver-mid">{"  "}Triggers on "review this" or{"\n"}</span>
      <span className="text-silver-mid">{"  "}"check this PR".{"\n"}</span>
      <span className="text-amber">triggers</span>
      <span className="text-silver-faint">:{"\n"}</span>
      <span className="text-silver-faint">{"  "}- </span>
      <span className="text-silver-mid">review this{"\n"}</span>
      <span className="text-silver-faint">{"  "}- </span>
      <span className="text-silver-mid">check this PR{"\n"}</span>
      <span className="text-silver-faint">{"  "}- </span>
      <span className="text-silver-mid">audit my code{"\n"}</span>
      <span className="text-silver-faint">---{"\n\n"}</span>
      <span className="text-headline font-bold"># TypeScript Code Review{"\n\n"}</span>
      <span className="text-amber">## What to check{"\n"}</span>
      <span className="text-silver-muted">- No implicit </span>
      <span className="text-headline">`any`</span>
      <span className="text-silver-muted"> — use proper generics{"\n"}</span>
      <span className="text-silver-muted">- Named exports only (no defaults in lib/){"\n"}</span>
      <span className="text-silver-muted">- Conventional Commits for all messages{"\n"}</span>
      <span className="text-silver-muted">- No direct DOM manipulation in React{"\n\n"}</span>
      <span className="text-amber">## Hard stops{"\n"}</span>
      <span className="text-silver-muted">- Never modify </span>
      <span className="text-headline">__tests__/</span>
      <span className="text-silver-muted"> or </span>
      <span className="text-headline">*.test.ts</span>
      <span className="text-silver-muted"> files{"\n"}</span>
      <span className="text-silver-muted">- Never disable TypeScript strict mode{"\n"}</span>
      <span className="text-silver-muted">- Never commit directly to main{"\n\n"}</span>
      <span className="text-amber">## Output format{"\n"}</span>
      <span className="text-silver-muted">Return a summary with:{"\n"}</span>
      <span className="text-silver-muted">- Issues found (severity: warn/error){"\n"}</span>
      <span className="text-silver-muted">- Suggested fix for each issue{"\n"}</span>
      <span className="text-silver-muted">- Conventional Commit message draft</span>
    </code>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-ink">

      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border-dark relative overflow-hidden">
        <GrainOverlay id="hero-grain" />
        <div className="max-w-6xl mx-auto px-6 lg:px-16 pt-16 pb-20 lg:pt-24 lg:pb-28 relative" style={{ zIndex: 2 }}>
          <div className="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-start">

            {/* Left — headline + CTA */}
            <div className="flex flex-col gap-8 relative">

              {/* Ghost watermark */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-6 -left-4 text-[10rem] lg:text-[14rem] font-black leading-none select-none"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1.5px #1a1d20",
                  fontFamily: "var(--font-serif)",
                  zIndex: 0,
                }}
              >
                SKILL
              </span>

              <div className="relative" style={{ zIndex: 1 }}>
                <span
                  className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  SKILL.md generator
                </span>
              </div>

              <h1
                className="leading-[1.04] tracking-tight relative"
                style={{ fontFamily: "var(--font-serif)", zIndex: 1 }}
              >
                <span className="block text-headline text-5xl lg:text-[4.5rem] font-black">
                  Your agent.
                </span>
                <span className="block text-headline text-5xl lg:text-[4.5rem] font-black">
                  Your rules.
                </span>
                <span className="block text-silver-muted text-5xl lg:text-[4.5rem] font-black italic">
                  Every session.
                </span>
              </h1>

              <p
                className="text-silver-muted text-[1.05rem] leading-[1.75] max-w-[360px]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Answer a few targeted questions about your workflow.
                Get a production-ready skill file for Claude, Copilot, ChatGPT, and every major AI agent.
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href="/generate"
                  className="gradient-silver-btn inline-block text-sm font-semibold px-6 py-3 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Build a Skill →
                </Link>
                <span
                  className="text-silver-dim text-xs"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Free · No login
                </span>
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
              <div
                className="rounded-[4px] overflow-hidden"
                style={{ border: "1px solid rgba(245,240,232,0.12)" }}
              >
                {/* Header bar */}
                <div
                  className="px-4 py-2.5 flex items-center gap-2.5"
                  style={{
                    background: "var(--color-code-header)",
                    borderBottom: "1px solid rgba(245,240,232,0.06)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full bg-green flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span
                    className="text-silver-dim text-[11px]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    skill.md
                  </span>
                </div>
                {/* Code */}
                <div className="bg-code-bg px-5 py-5 overflow-x-auto">
                  <SkillPreview />
                </div>
              </div>

              {/* Caption */}
              <p
                className="text-silver-faint text-[10px] mt-3 pl-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Example output · TypeScript / code review
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-24">

          {/* Section header — eyebrow + headline + supporting description */}
          <div className="mb-16">
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              The process
            </p>
            <h2
              className="text-headline text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              How it works.
            </h2>
            <p
              className="text-silver-muted text-[0.95rem] leading-relaxed max-w-md"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Five steps. Under two minutes. The specificity of the questions is
              what separates production-ready output from generic boilerplate.
            </p>
          </div>

          {/* Steps — hover: amber left accent, bg shift, text brightens, number scales */}
          <div className="divide-y divide-border-dark">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="group relative -mx-4 px-4 py-10 grid sm:grid-cols-[72px_1fr] gap-4 sm:gap-10 items-start motion-safe:transition-colors motion-safe:duration-200 hover:bg-[#0c0e10]"
              >
                {/* Left accent bar — appears on hover */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 inset-y-0 w-[2px] rounded-full bg-amber opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-200"
                />

                <span
                  className="text-amber text-5xl font-black leading-none motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-[1.06]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {step.n}
                </span>
                <div>
                  <h3
                    className="text-headline text-xl lg:text-2xl font-bold mb-2.5"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-silver-muted text-[0.95rem] leading-[1.7] max-w-lg motion-safe:transition-colors motion-safe:duration-200 group-hover:text-silver-mid"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <footer className="border-t border-border-dark relative overflow-hidden">
        <GrainOverlay id="footer-grain" />
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-16 relative" style={{ zIndex: 2 }}>

          {/* Two-column: left CTA, right stats */}
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-16 items-start">

            {/* Left — headline + CTA */}
            <div>
              <p
                className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-6"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Get started
              </p>

              <h2
                className="text-headline text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] mb-5"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Stop re-explaining yourself<br />
                to your agent.
              </h2>

              <p
                className="text-silver-muted text-[0.95rem] leading-relaxed mb-10 max-w-sm"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Build a SKILL.md in under two minutes.
                Free, no login required.
              </p>

              <Link
                href="/generate"
                className="gradient-silver-btn inline-block text-sm font-semibold px-6 py-3 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Build a Skill →
              </Link>
            </div>

            {/* Right — supporting stats */}
            <div className="hidden lg:flex flex-col gap-8 pt-1">
              {STATS.map((stat) => (
                <div key={stat.label} className="border-t border-border-dark pt-6">
                  <span
                    className="block text-headline text-4xl font-black leading-none mb-1.5"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="text-silver-dim text-[10px] uppercase tracking-[0.12em]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Footer bar */}
          <div className="mt-20 pt-6 border-t border-[#141618] flex items-center justify-between flex-wrap gap-4">
            <span
              className="text-silver-faint text-[11px]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              © 2026 SkillDraft.io
            </span>
            <span
              className="text-silver-faint text-[11px]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              agentskills.io standard
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
