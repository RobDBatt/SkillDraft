"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

// ─── FAQ data ──────────────────────────────────────────────────────────────────

const SKILL_MD_FAQS = [
  {
    id: "what-is",
    q: "What is a SKILL.md file?",
    a: "A SKILL.md file is a plain text instruction file that tells an AI coding agent how to behave in a specific context. When you place one in the right folder, the agent reads it automatically and follows the rules inside — without you having to explain your conventions every session.",
  },
  {
    id: "who-created",
    q: "Who created the SKILL.md standard?",
    a: "The agentskills.io open standard was released in late 2025. Anthropic adopted it for Claude Code, and it has since been supported by Cursor, OpenAI Codex, Gemini CLI, Windsurf, and others. SkillDraft is an independent tool built on top of this standard.",
  },
  {
    id: "global-vs-project",
    q: "What's the difference between a global and project-level skill?",
    a: "A global skill lives in your home directory (~/.claude/skills/) and applies to every project you work on. A project-level skill lives in the project root (.claude/skills/) and only applies to that repo. Use global skills for personal conventions, project-level skills for repo-specific rules.",
  },
  {
    id: "not-triggering",
    q: "Why is my skill not triggering?",
    a: "The most common reason is that the trigger phrases in your skill's description don't match what you're actually typing. The description field is what the agent reads to decide whether to load the skill — make sure it contains the exact phrases you use. SkillDraft front-loads trigger phrases in the description for this reason.",
  },
  {
    id: "multiple-platforms",
    q: "Can I use the same SKILL.md on multiple platforms?",
    a: "Yes — if you select \"Universal\" when generating, SkillDraft produces a file that works across Claude Code, Cursor, Codex, Gemini CLI, and Windsurf. GitHub Copilot and ChatGPT use different formats and need separate files.",
  },
  {
    id: "how-many",
    q: "How many skills should I have?",
    a: "Start with one per major workflow — a code review skill, a scaffolding skill, a commit message skill. Most developers end up with 3–8 skills. Too many skills with overlapping triggers can cause conflicts — use SkillDraft's conflict checker (coming in v2) to detect clashes.",
  },
];

const SKILLDRAFT_FAQS = [
  {
    id: "affiliated",
    q: "Is SkillDraft affiliated with Anthropic?",
    a: "No. SkillDraft is an independent tool. It uses the Anthropic API to generate skill files but is not made by or affiliated with Anthropic, Cursor, GitHub, or OpenAI.",
  },
  {
    id: "how-generates",
    q: "How does SkillDraft generate my skill?",
    a: "SkillDraft sends your answers to the Anthropic API along with a category-specific system prompt that knows the agentskills.io format rules. Claude generates the skill content — SkillDraft structures the questions to produce better output than a generic prompt would.",
  },
  {
    id: "data-stored",
    q: "Is my data stored anywhere?",
    a: "No. SkillDraft does not store your answers or generated skill files. Each generation is a stateless API call. Nothing is saved to a database.",
  },
  {
    id: "is-free",
    q: "Is SkillDraft free?",
    a: "Yes — v1 is completely free with no account required. There is a limit of 10 generations per day per IP address to prevent abuse.",
  },
  {
    id: "v2",
    q: "What's coming in v2?",
    a: "A skill grader that scores your generated file and flags issues, a conflict checker that detects clashing rules and trigger phrases within a skill, and a cross-skill conflict checker for teams managing multiple skills. Pro tier with saved skill libraries and bulk generation is also planned.",
  },
];

// ─── FAQ accordion item ────────────────────────────────────────────────────────

function FaqItem({ id, q, a }: { id: string; q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-dark">
      <button
        type="button"
        id={`faq-btn-${id}`}
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group focus-visible:outline-none"
        aria-expanded={open}
        aria-controls={`faq-ans-${id}`}
      >
        <span
          className="text-silver-lo text-[0.95rem] font-semibold leading-snug group-hover:text-headline motion-safe:transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {q}
        </span>
        <span
          className={`text-lg leading-none shrink-0 mt-0.5 motion-safe:transition-all motion-safe:duration-200 ${
            open ? "rotate-45 text-silver-mid" : "text-silver-dim group-hover:text-silver-muted"
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      {open && (
        <div id={`faq-ans-${id}`} className="pb-5">
          <p
            className="text-silver-muted text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FaqPage() {
  return (
    <div className="bg-ink min-h-screen">
      <SiteNav />

      <main className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-24">

        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <p
            className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            FAQ
          </p>
          <h1
            className="text-headline text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Frequently asked questions
          </h1>
          <p
            className="text-silver-muted text-[1rem] leading-relaxed"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Everything you need to know about SKILL.md files and SkillDraft.
          </p>
        </div>

        {/* Two-column grid — stacks on mobile */}
        <div className="grid md:grid-cols-2 gap-0 md:gap-12 lg:gap-16 items-start">

          {/* Left — About SKILL.md */}
          <div>
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-1 pb-4 border-b border-border-dark"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              About SKILL.md
            </p>
            {SKILL_MD_FAQS.map((faq) => (
              <FaqItem key={faq.id} {...faq} />
            ))}
          </div>

          {/* Right — About SkillDraft */}
          <div className="mt-12 md:mt-0">
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-1 pb-4 border-b border-border-dark"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              About SkillDraft
            </p>
            {SKILLDRAFT_FAQS.map((faq) => (
              <FaqItem key={faq.id} {...faq} />
            ))}
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-20 pt-10 border-t border-border-dark flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
          <div>
            <p
              className="text-headline text-lg font-bold mb-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Ready to build your first skill?
            </p>
            <p
              className="text-silver-muted text-sm"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Free, no account required. Takes under two minutes.
            </p>
          </div>
          <Link
            href="/generate"
            className="gradient-silver-btn inline-block text-sm font-semibold px-6 py-3 rounded-[4px] shrink-0 motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Build a Skill →
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border-dark py-6">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 flex items-center justify-between flex-wrap gap-4">
          <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
            © 2026 SkillDraft.io
          </span>
          <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
            agentskills.io standard
          </span>
        </div>
      </footer>
    </div>
  );
}
