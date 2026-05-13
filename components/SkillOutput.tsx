"use client";

import { useState } from "react";
import type { Category } from "@/lib/questions";
import type { PlatformId } from "@/lib/platforms";
import { getPlatformById } from "@/lib/platforms";

interface SkillOutputProps {
  content: string;
  category: Category;
  platform: PlatformId | null;
  onRegenerate: () => void;
  onStartOver: () => void;
}

const GENERIC_PATH = "~/.claude/skills/[name]/SKILL.md";

const CATEGORY_TIPS: Record<Category, string[]> = {
  development: [
    "Test trigger phrases against real commit messages — does Claude activate?",
    "Add actual file paths your project uses to the hard stops section.",
    "If the skill triggers too broadly, add 'do not use for' exclusions.",
  ],
  "frontend-design": [
    "Paste your full Tailwind config tokens into a future regeneration.",
    "Add real component names so Claude stays within your design system.",
    "The 'always include' rules override Claude's defaults — review them carefully.",
  ],
  "content-writing": [
    "Test tone by asking Claude to write a short intro and see if it matches.",
    "Add two real examples of good and bad output directly to the instructions.",
    "The avoid list is often more valuable than the rules list — be specific.",
  ],
  "data-integrations": [
    "Paste your actual schema or API response shape in a future iteration.",
    "Add example data transformations to ground the skill in real usage.",
    "Test on a small dataset before running against production data.",
  ],
  "project-workflows": [
    "Any gate Claude can skip will eventually be skipped — make them explicit.",
    "Add your team's PR template to the output format section.",
    "Run the skill at the start of every feature branch, not just at spec time.",
  ],
  "custom-other": [
    "Custom skills need precise trigger phrases — vague triggers misfire.",
    "If it activates too broadly, add 'do not use for X' exclusions.",
    "Test the exact phrases you typed and see if Claude picks up the skill.",
  ],
};

export default function SkillOutput({
  content,
  category,
  platform,
  onRegenerate,
  onStartOver,
}: SkillOutputProps) {
  const [copied, setCopied] = useState(false);

  const platformConfig = platform ? getPlatformById(platform) : null;
  const installPath = platformConfig?.installPath ?? GENERIC_PATH;
  const installNote = platformConfig?.installNote;
  const tips = CATEGORY_TIPS[category] ?? [];

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div>
          <p
            className="text-[#e8c87a] text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Step 5 of 5 — Your skill
          </p>
          <h1
            className="text-[#eceef0] text-4xl font-black leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Your SKILL.md is ready.
          </h1>
        </div>
        <div
          className="flex items-center gap-5 shrink-0 pt-1"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <button
            type="button"
            onClick={onRegenerate}
            className="text-[#4a5056] hover:text-[#9ea2a6] text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-[#9ea2a6]"
          >
            Regenerate
          </button>
          <button
            type="button"
            onClick={onStartOver}
            className="text-[#4a5056] hover:text-[#9ea2a6] text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-[#9ea2a6]"
          >
            Start over
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-[3fr_2fr] gap-6 items-start">

        {/* ── Left — Generated code ─────────────────────────────────── */}
        <div>
          <div
            className="rounded-[4px] overflow-hidden"
            style={{ border: "1px solid rgba(245,240,232,0.12)" }}
          >
            {/* Code block header */}
            <div
              className="px-4 py-2.5 flex items-center gap-2.5"
              style={{ background: "#0a0d10", borderBottom: "1px solid rgba(245,240,232,0.06)" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#5a9e6f]" aria-hidden="true" />
              <span
                className="text-[#4a5056] text-[11px]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                SKILL.md
              </span>
            </div>

            {/* Code content */}
            <div className="bg-[#0d1014] px-5 py-5 overflow-x-auto max-h-[560px] overflow-y-auto">
              <pre
                className="text-[#9ea2a6] text-[12.5px] leading-[1.75] whitespace-pre"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {content}
              </pre>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleCopy}
              className="gradient-silver-btn text-sm font-semibold px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ea2a6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] min-w-[152px] text-center"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {copied ? "Copied ✓" : "Copy to clipboard"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="border border-[#1e2428] text-[#6e7478] text-sm px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:border-[#3a4048] hover:text-[#cdd0d3] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6e7478] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Download SKILL.md
            </button>
          </div>
        </div>

        {/* ── Right — Tips panel ────────────────────────────────────── */}
        <div className="border border-[#1a1d20] rounded-[4px] p-6 flex flex-col gap-7">

          {/* What makes it good */}
          <div>
            <p
              className="text-[#e8c87a] text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              What makes this skill good
            </p>
            <ul className="flex flex-col gap-2">
              {[
                "Trigger phrases front-loaded in the description",
                "Explicit hard stops Claude cannot skip",
                "Domain-specific output format rules",
              ].map((point) => (
                <li
                  key={point}
                  className="text-[#6e7478] text-xs flex gap-2.5 leading-snug"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <span className="text-[#3a4048] shrink-0 mt-px">—</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* How to install */}
          <div>
            <p
              className="text-[#e8c87a] text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              How to install
            </p>
            <code
              className="text-[#5a9e6f] text-xs block bg-[#080a0c] border border-[#1a1d20] px-3 py-2 rounded-[2px] break-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {installPath}
            </code>
            <p
              className="text-[#6e7478] text-xs mt-2 leading-snug"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {installNote ?? (
                <>
                  Drop the file at that path and restart your agent session. Rename
                  the file to match the{" "}
                  <code className="text-[#9ea2a6]" style={{ fontFamily: "var(--font-mono)" }}>
                    name:
                  </code>{" "}
                  value in the frontmatter.
                </>
              )}
            </p>
          </div>

          {/* Improvement tips */}
          <div>
            <p
              className="text-[#e8c87a] text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Tips to improve it
            </p>
            <ul className="flex flex-col gap-2">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-[#6e7478] text-xs flex gap-2.5 leading-snug"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <span className="text-[#3a4048] shrink-0 mt-px">—</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
