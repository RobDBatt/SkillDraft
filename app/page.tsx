// Homepage — light/blue "SkillDraft" brand system, ported from the design
// prototype: sticky nav | hero with animated Pick→Answer→Generate pipeline |
// community marquee | trust strip | comparison | features + install band |
// how-it-works | closing CTA | footer.

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { Logo } from "@/components/Logo";
import { HomeMotion } from "@/components/HomeMotion";
import { CountUp } from "@/components/CountUp";
import { CopyButton } from "@/components/CopyButton";
import { VerifyHeroLink } from "@/components/VerifyHeroLink";
import { supabaseAdmin, safeSelect } from "@/lib/supabase-admin";

const CATEGORY_LABELS: Record<string, string> = {
  development: "Development",
  "frontend-design": "Frontend",
  "content-writing": "Content",
  "data-integrations": "Data",
  "project-workflows": "Project",
  "custom-other": "Custom",
};

type SkillCard = { name: string; score: number; cat: string; by: string };

const SAMPLE_ROW_A: SkillCard[] = [
  { name: "ts-code-review", score: 92, cat: "Development", by: "@arjun" },
  { name: "sql-guardrails", score: 95, cat: "Data", by: "@mira" },
  { name: "tailwind-audit", score: 90, cat: "Frontend", by: "@lena" },
  { name: "pr-summarizer", score: 88, cat: "Project", by: "@deniz" },
  { name: "prompt-linter", score: 93, cat: "Custom", by: "@kai" },
  { name: "a11y-checker", score: 91, cat: "Frontend", by: "@sam" },
];

const SAMPLE_ROW_B: SkillCard[] = [
  { name: "release-notes", score: 88, cat: "Project", by: "@wei" },
  { name: "api-contract", score: 89, cat: "Development", by: "@noa" },
  { name: "design-tokens", score: 94, cat: "Frontend", by: "@ivy" },
  { name: "migration-runner", score: 86, cat: "Data", by: "@tom" },
  { name: "changelog-writer", score: 87, cat: "Content", by: "@rae" },
  { name: "test-scaffold", score: 90, cat: "Development", by: "@os" },
];

function MarqueeRow({ items, reverse }: { items: SkillCard[]; reverse?: boolean }) {
  // Duplicate the items in markup for a seamless CSS loop (translateX -50%).
  const doubled = [...items, ...items];
  return (
    <div className={`marquee${reverse ? " rev" : ""}`}>
      <div className="marquee-track">
        {doubled.map((s, i) => (
          <div className="skill-card" key={`${s.name}-${i}`}>
            <div className="sc-top">
              <span className="sc-name">{s.name}</span>
              <span className="sc-score">{s.score}</span>
            </div>
            <div className="sc-meta">
              <span className="sc-cat">{s.cat}</span>
              <span className="sc-by">{s.by}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  // Pull a few top public skills for the community marquee (server-side).
  const previewSkills = await safeSelect(() =>
    supabaseAdmin
      .from("skills")
      .select("id, name, category, author_display_name, quality_score")
      .eq("is_public", true)
      .order("quality_score", { ascending: false, nullsFirst: false })
      .order("save_count", { ascending: false })
      .limit(6)
  );

  const realRow: SkillCard[] =
    previewSkills && previewSkills.length >= 4
      ? previewSkills.map((s) => ({
          name: s.name,
          score: s.quality_score ?? 0,
          cat: CATEGORY_LABELS[s.category] ?? s.category,
          by: s.author_display_name ? `@${s.author_display_name}` : "@community",
        }))
      : SAMPLE_ROW_A;

  return (
    <>
      <SiteNav />

      <main id="top">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="hero">
          <div className="wrap hero-stack">
            {/* aligned pipeline row */}
            <div className="hero-pipe" data-reveal style={{ "--d": ".06s" } as React.CSSProperties}>
              <div className="pipe-stages">
                <span className="pipe-flow" aria-hidden="true" />

                <div className="stage-col s1">
                  <span className="sp">
                    <i>◆</i> 1 · pick
                  </span>
                  <div className="float-card pc-cat">
                    <div className="fc-head">
                      <span className="fc-file">
                        <span className="ico">▤</span> category
                      </span>
                      <span className="fc-chip">Dev ✓</span>
                    </div>
                    <div className="fc-body">
                      <div className="cat-list">
                        <span className="cat sel">Development</span>
                        <span className="cat">Frontend</span>
                        <span className="cat">Content</span>
                        <span className="cat">Data &amp; ML</span>
                        <span className="cat">Project</span>
                        <span className="cat">Custom</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stage-col s2">
                  <span className="sp">
                    <i>◆</i> 2 · answer
                  </span>
                  <div className="float-card pc-q">
                    <div className="fc-head">
                      <span className="fc-file">
                        <span className="ico">▤</span> answers
                      </span>
                      <span className="fc-chip">5 / 5</span>
                    </div>
                    <div className="fc-body">
                      <div className="fcq-row">› Which dirs are off-limits?</div>
                      <div className="fcq-row">› Named or default exports?</div>
                      <div className="fcq-row sel">
                        › Commit policy <b>never to main</b> ✓
                      </div>
                      <div className="fcq-row sel">
                        › Never modify <b>__tests__/</b> ✓
                      </div>
                      <div className="fcq-row sel">
                        › Strict null checks <b>on</b> ✓
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stage-col s3">
                  <span className="sp">
                    <i>◆</i> 3 · generate
                  </span>
                  <div className="code-card pc-skill">
                    <span className="scan" aria-hidden="true" />
                    <div className="fc-head">
                      <span className="fc-file">
                        <span className="ico">▤</span> SKILL.md
                      </span>
                      <CountUp target={92} className="fc-chip score" />
                    </div>
                    <div className="code-body">
                      <span className="tk-com">---</span>
                      {"\n"}
                      <span className="tk-key">name</span>: ts-code-review{"\n"}
                      <span className="tk-key">description</span>: Reviews TS &amp; Next.js —{"\n"}
                      {"  "}type safety, naming, commit rules.{"\n"}
                      <span className="tk-com">---</span>
                      {"\n\n"}
                      <span className="tk-h">## Hard stops</span>
                      {"\n"}
                      <span className="tk-bul">-</span> Never modify{" "}
                      <span className="tk-bad">__tests__/</span> · never commit to main{"\n\n"}
                      <span className="tk-h">## Verification</span>
                      {"\n"}
                      <span className="tk-bul">-</span>{" "}
                      <span className="tk-chk">[ ]</span> No implicit any · named exports only
                      <span className="type-caret" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* lead copy */}
            <div className="hero-lead">
              <div className="hero-eyebrows" data-reveal style={{ "--d": ".02s" } as React.CSSProperties}>
                <span className="eyebrow">
                  <span className="tick">◆</span> SKILL.md generator
                </span>
                <span className="pill">
                  <span className="dot" /> Security scanned
                </span>
              </div>

              <h1 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
                Your agent.
                <br />
                Your rules.
                <br />
                <span className="accent">Every session.</span>
              </h1>

              <p className="hero-sub" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
                Answer a few targeted questions about your workflow. Get a
                production-ready, quality-scored <span className="mono">SKILL.md</span> for
                every major AI agent.
              </p>

              <div className="hero-actions" data-reveal style={{ "--d": ".22s" } as React.CSSProperties}>
                <Link className="btn btn-primary" href="/generate">
                  Build a Skill <span className="arr">→</span>
                </Link>
                <Link className="btn btn-ghost" href="/explore">
                  Browse community <span className="arr">→</span>
                </Link>
              </div>

              <p className="hero-verify" data-reveal style={{ "--d": ".25s" } as React.CSSProperties}>
                Already have a skill — from an AI agent, a teammate, the community?{" "}
                <VerifyHeroLink />
              </p>

              <div className="cmd" data-reveal style={{ "--d": ".28s" } as React.CSSProperties}>
                <span className="prompt">$</span>
                <span>npx skilldraft install &lt;id&gt;</span>
                <span className="cmd-note">auto-installs to every detected agent</span>
                <CopyButton text="npx skilldraft install <id>" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Community marquee ────────────────────────────────────── */}
        <section className="community">
          <div className="wrap community-head">
            <div className="ch-l">
              <span className="section-label">Fresh from the community</span>
              <h3>Skills people are shipping right now.</h3>
            </div>
            <Link href="/explore">
              Browse all community skills <span>→</span>
            </Link>
          </div>

          <MarqueeRow items={realRow} />
          <MarqueeRow items={SAMPLE_ROW_B} reverse />
        </section>

        {/* ── Trust strip ──────────────────────────────────────────── */}
        <div className="strip">
          <div className="wrap strip-inner">
            <span className="si">
              <span className="g">◎</span> Built on the Anthropic API
            </span>
            <span className="sep">/</span>
            <span className="si">
              <span className="g">◈</span> Security scanned before publishing
            </span>
            <span className="sep">/</span>
            <span className="si">
              <span className="g">◇</span> Scored on 7 dimensions
            </span>
            <span className="sep">/</span>
            <span className="si">
              <span className="g">◻</span> agentskills.io open standard
            </span>
            <Link href="/explore">
              Community skills <span>→</span>
            </Link>
          </div>
        </div>

        {/* ── Comparison ───────────────────────────────────────────── */}
        <section className="compare" id="compare">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <span className="section-label">The difference</span>
              <h2>
                Most instructions get ignored.
                <br />A skill doesn&apos;t.
              </h2>
              <p>
                A one-line ask your agent forgets by the third message becomes a
                structured, scored, scanned SKILL.md it follows every session.
              </p>
            </div>

            <div className="pipeline">
              <span className="flow-dot" aria-hidden="true" />

              <div className="stage" data-reveal style={{ "--d": ".04s" } as React.CSSProperties}>
                <span className="stage-tag bad">✕ vague prose</span>
                <div className="note-card">
                  <span className="ignored">ignored</span>
                  <p className="q">
                    &quot;be careful with the tests, use good naming, and please
                    don&apos;t break anything this time&quot;
                  </p>
                  <span className="nm">— pasted into chat · forgotten by msg #3</span>
                </div>
              </div>

              <div className="flow" data-reveal style={{ "--d": ".12s" } as React.CSSProperties}>
                <span className="fl-pill">
                  <i>◆</i> structure
                </span>
                <span className="fl-seg" />
                <span className="fl-pill">
                  <i>◆</i> score
                </span>
                <span className="fl-seg" />
                <span className="fl-pill">
                  <i>◆</i> scan
                </span>
                <span className="fl-arrow">→</span>
              </div>

              <div className="stage" data-reveal style={{ "--d": ".18s" } as React.CSSProperties}>
                <span className="stage-tag good">✓ production-ready</span>
                <div className="code-card mini">
                  <div className="code-head">
                    <span className="code-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="code-file">
                      <span className="ico">▤</span> ts-code-review.md
                    </span>
                    <CountUp target={92} className="score" />
                  </div>
                  <div className="code-body">
                    <span className="tk-com">---</span>
                    {"\n"}
                    <span className="tk-key">name</span>: ts-code-review{"\n"}
                    <span className="tk-key">description</span>: Reviews TS &amp; Next.js — type{"\n"}
                    {"  "}safety, naming, rules. <span className="tk-str">Use when</span>: &quot;review{"\n"}
                    {"  "}this&quot;, &quot;check PR&quot;. Not for greenfield.{"\n"}
                    <span className="tk-com">---</span>
                    {"\n"}
                    <span className="tk-h">## Hard stops</span>
                    {"\n"}
                    <span className="tk-bul">-</span> Never modify{" "}
                    <span className="tk-bad">__tests__/</span> · never commit to main{"\n"}
                    <span className="tk-h">## Verification</span>
                    {"\n"}
                    <span className="tk-bul">-</span> <span className="tk-chk">[ ]</span> No implicit
                    any · named exports only
                  </div>
                </div>
              </div>
            </div>

            <div className="annot" data-reveal>
              input: <b>1 line</b> → output: <b>7 sections</b> · hard stops ·
              anti-patterns · checklist · scored <b>92/100</b>
            </div>

            <div className="agent-wall" data-reveal>
              <span className="aw-label">One file · written natively for every agent</span>
              <div className="aw-marks">
                <span>Claude Code</span>
                <span>Cursor</span>
                <span>Windsurf</span>
                <span>Codex CLI</span>
                <span>Gemini CLI</span>
                <span>GitHub Copilot</span>
                <span>ChatGPT</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why ──────────────────────────────────────────────────── */}
        <section className="section" id="why">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <span className="section-label">Why SkillDraft</span>
              <h2>Skills that actually work.</h2>
              <p>
                Most agent instructions are vague prose that the model quietly
                ignores. SkillDraft enforces structure, then proves it.
              </p>
            </div>

            <div className="features">
              <div className="feature" data-reveal style={{ "--d": ".04s" } as React.CSSProperties}>
                <span className="fnum">01</span>
                <div className="ficon">◇</div>
                <h3>Quality scored</h3>
                <p>
                  Every skill is rated 0–100 across seven dimensions — description
                  density, why-annotations, when-not-to-use, output template, hard
                  stops, anti-patterns, and a verification checklist. Nothing vague
                  ships.
                </p>
              </div>
              <div className="feature" data-reveal style={{ "--d": ".12s" } as React.CSSProperties}>
                <span className="fnum">02</span>
                <div className="ficon">◈</div>
                <h3>Security scanned</h3>
                <p>
                  Checked for prompt injection, dangerous shell commands,
                  data-exfiltration patterns, and obfuscation before anything is
                  published. Community skills you can actually trust.
                </p>
              </div>
              <div className="feature" data-reveal style={{ "--d": ".20s" } as React.CSSProperties}>
                <span className="fnum">03</span>
                <div className="ficon">◎</div>
                <h3>One-command install</h3>
                <p>
                  The CLI auto-detects which AI agents you have installed and writes
                  the skill to each. Claude Code, Cursor, Windsurf, Codex CLI — one
                  command covers all of them.
                </p>
              </div>
            </div>

            {/* install band */}
            <div className="band" id="install" data-reveal>
              <div className="band-copy">
                <span className="section-label">Install</span>
                <h3 style={{ marginTop: 14 }}>Any community skill, one command.</h3>
                <p>
                  Auto-detects Claude Code, Cursor, Windsurf, Codex CLI, and Gemini
                  CLI — then writes the file to each agent directory automatically.
                  No copy-paste, no wrong paths.
                </p>
              </div>
              <div className="band-term">
                <div className="tbar">
                  <i /> zsh — skilldraft
                </div>
                <div className="tbody">
                  <span className="pr">$</span>{" "}
                  <span className="wt">npx skilldraft install ts-code-review</span>
                  {"\n"}
                  <span className="dm">› detecting agents…</span>
                  {"\n"}
                  <span className="ok">✓</span> Claude Code{"      "}
                  <span className="dm">~/.claude/skills/</span>
                  {"\n"}
                  <span className="ok">✓</span> Cursor{"           "}
                  <span className="dm">~/.cursor/rules/</span>
                  {"\n"}
                  <span className="ok">✓</span> Windsurf{"         "}
                  <span className="dm">~/.windsurf/</span>
                  {"\n"}
                  <span className="ok">✓</span> Codex CLI{"        "}
                  <span className="dm">~/.codex/</span>
                  {"\n"}
                  <span className="ok">✓</span>{" "}
                  <span className="wt">installed to 4 agents · 92/100</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How ──────────────────────────────────────────────────── */}
        <section className="section" id="how" style={{ paddingTop: 8 }}>
          <div className="wrap">
            <div className="section-head" data-reveal>
              <span className="section-label">The process</span>
              <h2>How it works.</h2>
              <p>
                Five steps, under two minutes. The specificity of the questions is
                what separates production-ready output from generic boilerplate.
              </p>
            </div>

            <div className="steps">
              <div className="step" data-reveal style={{ "--d": ".02s" } as React.CSSProperties}>
                <span className="snum">01</span>
                <h4>Choose a category</h4>
                <p>
                  Six workflow types — Development, Frontend, Content, Data, Project,
                  or Custom. Each has its own tailored question set.
                </p>
              </div>
              <div className="step" data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
                <span className="snum">02</span>
                <h4>Pick your agent</h4>
                <p>
                  Claude Code, Cursor, Copilot, ChatGPT, Windsurf, Codex, Gemini, or
                  Universal. Platform drives format, path, and triggers.
                </p>
              </div>
              <div className="step" data-reveal style={{ "--d": ".14s" } as React.CSSProperties}>
                <span className="snum">03</span>
                <h4>Answer the questions</h4>
                <p>
                  Three to five domain-specific questions — no generic text boxes.
                  Specificity is what makes the output production-ready.
                </p>
              </div>
              <div className="step" data-reveal style={{ "--d": ".20s" } as React.CSSProperties}>
                <span className="snum">04</span>
                <h4>Watch it generate</h4>
                <p>
                  Assembled in real time via the Anthropic API — instructions, hard
                  stops, anti-patterns, checklist — in about ten seconds.
                </p>
              </div>
              <div className="step" data-reveal style={{ "--d": ".26s" } as React.CSSProperties}>
                <span className="snum">05</span>
                <h4>Install or copy</h4>
                <p>
                  Drop it in your skills folder, or run{" "}
                  <span className="mono">skilldraft install</span> to write it to every
                  detected agent.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────── */}
        <section className="cta-final" id="start">
          <div className="wrap inner">
            <span className="section-label" data-reveal>
              Get started
            </span>
            <h2 data-reveal style={{ "--d": ".06s" } as React.CSSProperties}>
              Stop re-explaining yourself to your agent.
            </h2>
            <p data-reveal style={{ "--d": ".12s" } as React.CSSProperties}>
              Build a SKILL.md in under two minutes. Free, no login required — save
              and share with an account.
            </p>
            <div className="hero-actions" data-reveal style={{ "--d": ".18s" } as React.CSSProperties}>
              <Link className="btn btn-primary" href="/generate">
                Build a Skill <span className="arr">→</span>
              </Link>
              <Link className="btn btn-ghost" href="/explore">
                Browse skills <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="wrap footer-inner">
          <Logo href="/" />
          <nav className="footer-links">
            <Link href="/generate">Generate</Link>
            <Link href="/improve">Improve</Link>
            <Link href="/explore">Explore</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/install">Install</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
          <div className="footer-meta">
            <span>© 2026 SkillDraft.io</span>
            <span>agentskills.io standard</span>
          </div>
        </div>
      </footer>

      <HomeMotion />
    </>
  );
}
