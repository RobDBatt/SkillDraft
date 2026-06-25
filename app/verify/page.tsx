"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { SiteNav } from "@/components/SiteNav";
import { extractSkillName } from "@/lib/supabase";
import {
  scoreSkill,
  scoreLabel,
  scoreColor,
  type QualityBreakdown,
} from "@/lib/scoreSkill";
import { scanSecurity, type ScanResult } from "@/lib/scanSecurity";

const MAX_INPUT = 50_000;

// 7 scoring dimensions (maxes sum to 100), ordered by weight.
const DIMENSIONS: { key: keyof QualityBreakdown; label: string; max: number }[] = [
  { key: "descriptionScore",  label: "Description & triggers", max: 25 },
  { key: "whenNotScore",      label: "When NOT to use",       max: 15 },
  { key: "templateScore",     label: "Output template",       max: 15 },
  { key: "antiPatternsScore", label: "Anti-patterns",         max: 15 },
  { key: "whyScore",          label: "“Why” annotations",     max: 10 },
  { key: "hardStopsScore",    label: "Hard stops",            max: 10 },
  { key: "checklistScore",    label: "Verification checklist", max: 10 },
];

const SCANNED = [
  "Prompt injection",
  "Dangerous shell commands",
  "Data exfiltration",
  "Obfuscated payloads",
];

function barColor(ratio: number): string {
  if (ratio >= 0.85) return "bg-green";
  if (ratio >= 0.5) return "bg-amber";
  if (ratio > 0) return "bg-silver-mid";
  return "bg-silver-faint";
}

/** Bucket content length for analytics (avoids sending exact sizes). */
function lengthBand(n: number): string {
  if (n < 500) return "<500";
  if (n < 2_000) return "500-2k";
  if (n < 10_000) return "2k-10k";
  return "10k+";
}

interface Report {
  breakdown: QualityBreakdown;
  scan: ScanResult;
  name: string;
}

export default function VerifyPage() {
  const [inputText, setInputText] = useState("");
  const [report, setReport] = useState<Report | null>(null);

  const charsLeft = MAX_INPUT - inputText.length;

  const handleVerify = useCallback(() => {
    const content = inputText.trim();
    if (!content) return;
    const breakdown = scoreSkill(content);
    const scan = scanSecurity(content);
    // Privacy: only metadata is tracked — never the skill content or name.
    // The score band is the key signal: skills generated on-site score 85+,
    // so a spike in "Fair"/"Basic" runs means people are bringing skills
    // authored elsewhere (the demand the /verify wedge is testing).
    track("verify_run", {
      passed: scan.passed,
      score: breakdown.score,
      band: scoreLabel(breakdown.score),
      flaggedFor: scan.category ?? "none",
      hasFrontmatter: /^---\r?\n/.test(content),
      length: lengthBand(content.length),
    });
    setReport({ breakdown, scan, name: extractSkillName(content) || "" });
    // Keep input so the user can edit and re-verify.
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [inputText]);

  const handleReset = useCallback(() => {
    setReport(null);
    setInputText("");
  }, []);

  const score = report?.breakdown.score ?? 0;
  const passed = report?.scan.passed ?? false;

  // Stash the verified content so /improve can offer to act on it.
  const improveHref = useMemo(() => {
    if (typeof window !== "undefined" && report) {
      try { sessionStorage.setItem("skilldraft-verify-input", inputText.trim()); } catch {}
    }
    return "/improve";
  }, [report, inputText]);

  // ─── Input phase ────────────────────────────────────────────────────────────
  if (!report) {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <SiteNav />
        <main className="flex-1 flex flex-col items-center justify-start pt-16 pb-24 px-6">
          <div className="w-full max-w-2xl">
            <div className="mb-8">
              <p
                className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Skill Verifier · Free
              </p>
              <h1
                className="text-headline text-3xl font-black leading-tight mb-3"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Verify any SKILL.md
              </h1>
              <p className="text-silver-muted text-sm leading-relaxed">
                Paste a skill from <strong className="text-silver-mid">anywhere</strong> — an AI
                agent wrote it, a teammate shared it, you found it in the community — and check it
                before you install. Instant security scan and a 0–100 quality score. No sign-up, no
                credits.
              </p>
            </div>

            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, MAX_INPUT))}
                placeholder={"---\nname: my-skill\ndescription: …\n---\n\nPaste your SKILL.md content here…"}
                className="w-full h-96 bg-surface border border-border-dark rounded-[4px] px-4 py-3.5 text-silver-mid text-[12.5px] leading-[1.75] resize-none focus:outline-none focus:border-silver-dim placeholder:text-silver-faint"
                style={{ fontFamily: "var(--font-mono)" }}
                spellCheck={false}
              />
              <span
                className={`absolute bottom-3 right-3 text-[11px] tabular-nums pointer-events-none ${
                  charsLeft < 2000 ? "text-amber" : "text-silver-faint"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {charsLeft.toLocaleString()}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <p
                className="text-silver-faint text-[11px]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Runs in your browser · nothing is uploaded
              </p>
              <button
                type="button"
                onClick={handleVerify}
                disabled={!inputText.trim()}
                className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Verify →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Result phase ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-20 max-w-5xl mx-auto w-full">
        <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
          <div>
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Verification report
            </p>
            <h1
              className="text-headline text-3xl font-black leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {report.name ? report.name : "Your SKILL.md"}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors focus-visible:outline-none mt-1 shrink-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← Verify another
          </button>
        </div>

        {/* Two summary cards: security verdict + quality score */}
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {/* Security */}
          <div
            className={`border rounded-[4px] p-6 ${
              passed ? "border-green/40" : "border-red-500/50"
            }`}
            style={{ background: "var(--color-surface)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3 text-silver-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Security scan
            </p>
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`text-2xl ${passed ? "text-green" : "text-red-500"}`}
                aria-hidden="true"
              >
                {passed ? "✓" : "⚠"}
              </span>
              <span
                className={`text-xl font-black ${passed ? "text-green" : "text-red-500"}`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {passed ? "No issues found" : "Flagged"}
              </span>
            </div>
            {passed ? (
              <p className="text-silver-muted text-xs leading-relaxed">
                Clean against all checks: {SCANNED.join(", ").toLowerCase()}.
              </p>
            ) : (
              <p className="text-silver-muted text-xs leading-relaxed">
                {report.scan.reason}
              </p>
            )}
          </div>

          {/* Quality score */}
          <div
            className="border border-border-dark rounded-[4px] p-6"
            style={{ background: "var(--color-surface)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3 text-silver-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Quality score
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className={`text-4xl font-black tabular-nums ${scoreColor(score)}`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {score}
              </span>
              <span className="text-silver-faint text-lg" style={{ fontFamily: "var(--font-mono)" }}>
                / 100
              </span>
              <span
                className={`ml-1 text-sm font-semibold ${scoreColor(score)}`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {scoreLabel(score)}
              </span>
            </div>
            <p className="text-silver-muted text-xs leading-relaxed mt-2">
              Scored against a 7-dimension rubric benchmarked on Anthropic&apos;s reference skills.
            </p>
          </div>
        </div>

        {/* Dimension breakdown */}
        <div
          className="border border-border-dark rounded-[4px] p-6 mb-8"
          style={{ background: "var(--color-surface)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-5 text-silver-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Score breakdown
          </p>
          <div className="flex flex-col gap-4">
            {DIMENSIONS.map(({ key, label, max }) => {
              const val = report.breakdown[key];
              const ratio = max > 0 ? val / max : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-silver-mid text-xs"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-silver-faint text-[11px] tabular-nums"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {val} / {max}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-code-bg overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor(ratio)} motion-safe:transition-all`}
                      style={{ width: `${Math.round(ratio * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <Link
            href={improveHref}
            onClick={() => track("verify_cta", { action: "improve", band: scoreLabel(score), passed })}
            className="gradient-silver-btn text-sm font-semibold px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Improve this skill →
          </Link>
          <Link
            href="/explore"
            onClick={() => track("verify_cta", { action: "explore" })}
            className="border border-border-dark text-silver-muted text-sm px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:border-silver-faint hover:text-silver-lo active:scale-[0.98] focus-visible:outline-none"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Browse verified skills →
          </Link>
        </div>

        <p
          className="text-silver-faint text-[11px] leading-relaxed max-w-2xl"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Heuristic scan — it flags known unsafe patterns and structural quality signals, not a
          guarantee of safety or correctness. Always review a skill before installing it into an
          agent with file or shell access.
        </p>
      </main>
    </div>
  );
}
