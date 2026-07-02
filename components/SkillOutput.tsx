"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/questions";
import type { PlatformId } from "@/lib/platforms";
import { getPlatformById } from "@/lib/platforms";
import { supabase, extractSkillName } from "@/lib/supabase";
import { AgentTargetSelector } from "@/components/AgentTargets";
import { scoreSkill } from "@/lib/scoreSkill";

interface SkillOutputProps {
  content: string;
  category: Category;
  platform: PlatformId | null;
  onRegenerate: () => void;
  onStartOver: () => void;
  isGenerating?: boolean;
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
  "devops-infrastructure": [
    "Paste your actual pipeline YAML into a future regeneration — context prevents generic output.",
    "Add your cloud provider and region to the hard stops section.",
    "The rollback step is the most commonly skipped — make it the first hard stop.",
  ],
  security: [
    "Name the specific attack vector you're defending against — generic 'security' is too broad.",
    "Add two real examples of vulnerable vs. fixed code from your codebase.",
    "Compliance requirements change what's a warning vs. a hard stop — be explicit.",
  ],
  "backend-frameworks": [
    "Paste your actual file structure so the skill generates matching paths.",
    "Name your ORM and eager-loading pattern explicitly to prevent N+1 queries.",
    "If you use a service layer, name the naming convention so generated code matches.",
  ],
  "git-version-control": [
    "Paste your real commit/PR template so the skill matches it exactly.",
    "Name your convention (Conventional Commits, gitmoji) — the format is unforgiving.",
    "Force-push and secret-commit guards belong in the hard stops — make them explicit.",
  ],
  "database-sql": [
    "Name your engine — Postgres and MySQL differ on syntax and EXPLAIN output.",
    "Parameterisation and 'no SELECT *' are the highest-value hard stops here.",
    "If you use an ORM, say which one so the skill reviews its queries, not just raw SQL.",
  ],
  "custom-other": [
    "Custom skills need precise trigger phrases — vague triggers misfire.",
    "If it activates too broadly, add 'do not use for X' exclusions.",
    "Test the exact phrases you typed and see if Claude picks up the skill.",
  ],
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SkillOutput({
  content,
  category,
  platform,
  onRegenerate,
  onStartOver,
  isGenerating = false,
}: SkillOutputProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [agentTargets, setAgentTargets] = useState<string[]>([]);

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

  async function handleSave() {
    if (saveState !== "idle") return;
    setSaveState("saving");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      setSaveState("idle");
      return;
    }

    const { score } = scoreSkill(content);
    const { error } = await supabase.from("skills").insert({
      user_id: user.id,
      name: extractSkillName(content) || category,
      category,
      platform: platform ?? null,
      content,
      source: "generate",
      agent_targets: agentTargets,
      quality_score: score,
    });

    if (error) {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    } else {
      setSaveState("saved");
    }
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
            className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Step 5 of 5 — Your skill
          </p>
          <h1
            className="text-headline text-4xl font-black leading-tight"
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
            disabled={isGenerating}
            className={`text-xs motion-safe:transition-colors focus-visible:outline-none ${
              isGenerating
                ? "text-silver-dim opacity-40 cursor-not-allowed"
                : "text-silver-dim hover:text-silver-mid focus-visible:text-silver-mid"
            }`}
          >
            {isGenerating ? "Generating…" : "Regenerate"}
          </button>
          <button
            type="button"
            onClick={onStartOver}
            disabled={isGenerating}
            className={`text-xs motion-safe:transition-colors focus-visible:outline-none ${
              isGenerating
                ? "text-silver-dim opacity-40 cursor-not-allowed"
                : "text-silver-dim hover:text-silver-mid focus-visible:text-silver-mid"
            }`}
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
            style={{ border: "1px solid var(--color-border-dark)" }}
          >
            {/* Code block header */}
            <div
              className="px-4 py-2.5 flex items-center gap-2.5"
              style={{ background: "var(--color-code-header)", borderBottom: "1px solid var(--color-border-dark)" }}
            >
              <span className="w-2 h-2 rounded-full bg-green" aria-hidden="true" />
              <span
                className="text-silver-dim text-[11px]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                SKILL.md
              </span>
            </div>

            {/* Code content */}
            <div className="bg-code-bg px-5 py-5 overflow-x-auto max-h-[560px] overflow-y-auto">
              <pre
                className="text-silver-mid text-[12.5px] leading-[1.75] whitespace-pre"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {content}
              </pre>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="gradient-silver-btn text-sm font-semibold px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink min-w-[152px] text-center"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {copied ? "Copied ✓" : "Copy to clipboard"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="border border-border-dark text-silver-muted text-sm px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:border-silver-faint hover:text-silver-lo active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-muted focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Download SKILL.md
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === "saving" || saveState === "saved"}
              className="border border-border-dark text-silver-muted text-sm px-5 py-2.5 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:border-silver-faint hover:text-silver-lo active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-muted focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                ? "Saved ✓"
                : saveState === "error"
                ? "Save failed"
                : "Save skill"}
            </button>
          </div>
        </div>

        {/* ── Right — Panel ────────────────────────────────────── */}
        <div className="border border-border-dark rounded-[4px] p-6 flex flex-col gap-7">

          {/* What makes it good */}
          <div>
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
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
                  className="text-silver-muted text-xs flex gap-2.5 leading-snug"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <span className="text-silver-faint shrink-0 mt-px">—</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* How to install */}
          <div>
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              How to install
            </p>
            <code
              className="text-green text-xs block bg-code-bg border border-border-dark px-3 py-2 rounded-[2px] break-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {installPath}
            </code>
            <p
              className="text-silver-muted text-xs mt-2 leading-snug"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {installNote ?? (
                <>
                  Drop the file at that path and restart your agent session. Rename
                  the file to match the{" "}
                  <code className="text-silver-mid" style={{ fontFamily: "var(--font-mono)" }}>
                    name:
                  </code>{" "}
                  value in the frontmatter.
                </>
              )}
            </p>
          </div>

          {/* Agent targets */}
          <div>
            <AgentTargetSelector
              selected={agentTargets}
              onChange={setAgentTargets}
              label="Target agents"
            />
            <p
              className="text-silver-faint text-[10px] mt-2 leading-snug"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Shown as badges on your card if you share it to Explore.
            </p>
          </div>

          {/* Improvement tips */}
          <div>
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Tips to improve it
            </p>
            <ul className="flex flex-col gap-2">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-silver-muted text-xs flex gap-2.5 leading-snug"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <span className="text-silver-faint shrink-0 mt-px">—</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Support — shown once the skill has finished generating ───────── */}
      {!isGenerating && content && (
        <div className="mt-10 pt-6 border-t border-border-dark flex flex-col items-center gap-2.5 text-center">
          <p
            className="text-silver-muted text-xs"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Saved you some time? Help keep SkillDraft running.
          </p>
          <a
            href="https://buymeacoffee.com/battbotstu0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-amber/40 text-amber text-sm font-semibold px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:bg-amber/10 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <span aria-hidden="true">☕</span> Buy me a coffee
          </a>
        </div>
      )}
    </div>
  );
}
