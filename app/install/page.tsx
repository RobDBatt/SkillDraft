"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

// ─── Data ──────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: "claude-code-global",
    name: "Claude Code — Global",
    path: "~/.claude/skills/[skill-name]/SKILL.md",
    note: "Rename the folder to match the name: value in your skill's frontmatter. Claude Code loads global skills automatically at the start of every session.",
  },
  {
    id: "claude-code-project",
    name: "Claude Code — Project-level",
    path: ".claude/skills/[skill-name]/SKILL.md",
    note: "Place this in your project root. Use project-level skills for repo-specific conventions that shouldn't apply everywhere.",
  },
  {
    id: "cursor",
    name: "Cursor",
    path: ".cursor/rules/[skill-name].mdc",
    note: "Place in your project root. Rename the file to match your skill name. Cursor reads .mdc files from the .cursor/rules/ directory automatically.",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    path: ".github/copilot-instructions.md",
    note: "Paste your skill content into this file. Copilot uses a single instructions file per repo — if one already exists, append your skill content to it.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    path: null,
    settingsPath: "Settings → Personalization → Custom Instructions",
    note: 'Paste your skill content into the "How would you like ChatGPT to respond?" field. This applies globally to all your ChatGPT conversations.',
  },
  {
    id: "windsurf",
    name: "Windsurf",
    path: ".windsurf/rules/[skill-name].md",
    note: "Place in your project root. Windsurf reads all .md files from the .windsurf/rules/ directory.",
  },
  {
    id: "codex",
    name: "Codex CLI",
    path: "~/.codex/skills/[skill-name]/SKILL.md",
    note: "Global install — applies across all Codex sessions. Rename the folder to match the name: value in your skill's frontmatter.",
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    path: "~/.gemini/skills/[skill-name]/SKILL.md",
    note: "Global install — applies across all Gemini CLI sessions. Rename the folder to match the name: value in your skill's frontmatter.",
  },
];

// ─── Accordion item ────────────────────────────────────────────────────────────

function InstallItem({
  name,
  path,
  settingsPath,
  note,
}: {
  name: string;
  path: string | null;
  settingsPath?: string;
  note: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayPath = path ?? settingsPath ?? "";

  function handleCopy() {
    navigator.clipboard.writeText(displayPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="border-b border-border-dark">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group focus-visible:outline-none"
        aria-expanded={open}
      >
        <span
          className="text-silver-lo text-lg font-bold leading-snug group-hover:text-headline motion-safe:transition-colors"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {name}
        </span>
        <span
          className={`text-xl leading-none shrink-0 motion-safe:transition-all motion-safe:duration-200 ${
            open ? "rotate-45 text-silver-mid" : "text-silver-dim group-hover:text-silver-muted"
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      {open && (
        <div className="pb-7">
          {/* Path block */}
          <div
            className="rounded-[4px] overflow-hidden mb-4"
            style={{ border: "1px solid var(--color-border-dark)" }}
          >
            <div
              className="px-4 py-2 flex items-center justify-between gap-4"
              style={{
                background: "var(--color-code-header)",
                borderBottom: "1px solid var(--color-border-dark)",
              }}
            >
              <span
                className="text-silver-faint text-[10px] uppercase tracking-[0.1em]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {path ? "install path" : "settings path"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-silver-dim hover:text-silver-mid text-[10px] shrink-0 motion-safe:transition-colors focus-visible:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {copied ? "copied ✓" : "copy"}
              </button>
            </div>
            <div className="bg-code-bg px-4 py-3">
              <code
                className={`text-[12.5px] leading-relaxed break-all ${
                  path ? "text-green" : "text-silver-muted"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {displayPath}
              </code>
            </div>
          </div>

          <p
            className="text-silver-muted text-sm leading-relaxed max-w-xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {note}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function InstallPage() {
  return (
    <div className="bg-ink min-h-screen">
      <SiteNav />

      <main className="max-w-3xl mx-auto px-6 pt-20 pb-24">

        {/* Section header */}
        <p
          className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-4"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Installation guide
        </p>
        <h1
          className="text-headline text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Install your SKILL.md
        </h1>
        <p
          className="text-silver-muted text-[1rem] leading-relaxed mb-16 max-w-xl"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          You generated your file. Here's exactly where to put it — for every major AI agent.
        </p>

        {/* Accordion */}
        <div className="border-t border-border-dark">
          {PLATFORMS.map((p) => (
            <InstallItem
              key={p.id}
              name={p.name}
              path={p.path}
              settingsPath={"settingsPath" in p ? p.settingsPath : undefined}
              note={p.note}
            />
          ))}
        </div>

        {/* Tip block */}
        <div
          className="mt-12 rounded-[4px] px-6 py-5 flex gap-4"
          style={{
            border: "1px solid var(--color-border-dark)",
            background: "var(--accent-soft)",
          }}
        >
          <span
            className="text-amber text-[10px] font-semibold uppercase tracking-[0.14em] shrink-0 mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Tip
          </span>
          <p
            className="text-silver-muted text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            The{" "}
            <code className="text-silver-mid" style={{ fontFamily: "var(--font-mono)" }}>
              name:
            </code>{" "}
            value in the frontmatter must match your folder or file name exactly. If they
            don't match, some agents won't load the skill correctly.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-10 border-t border-border-dark">
          <p
            className="text-silver-muted text-sm mb-5"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Don't have a skill yet?
          </p>
          <Link
            href="/generate"
            className="gradient-silver-btn inline-block text-sm font-semibold px-6 py-3 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Build one free →
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
