"use client";

// Step 3 — animated loading state shown while the API call runs.
// Fake-types SKILL.md lines into a code pane; cycles status messages.

import { useEffect, useState } from "react";

const LINES = [
  "---",
  "name: your-skill",
  "description: |",
  "  Triggers when you need to...",
  "  Detects intent from keywords...",
  "  Scoped to your workflow only.",
  "---",
  "",
  "# Your Skill",
  "",
  "## When to use this",
  "- Activated by trigger phrases",
  "- Scoped to your workflow",
  "",
  "## Instructions",
  "- Follow the rules you defined",
  "- Never do what you said to avoid",
  "",
  "## Hard stops",
  "- Never bypass the gates you set",
];

const MESSAGES = [
  "Drafting your skill...",
  "Checking trigger description...",
  "Finalising instructions...",
];

export default function GeneratingState() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  // Type lines in one at a time
  useEffect(() => {
    if (visibleLines >= LINES.length) return;
    const delay = visibleLines < 7 ? 90 : 130;
    const t = setTimeout(() => setVisibleLines((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [visibleLines]);

  // Cycle status messages every 2.2 s
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((n) => Math.min(n + 1, MESSAGES.length - 1));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p
        className="text-[#e8c87a] text-[10px] uppercase tracking-[0.18em] mb-8"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Step 3 of 4 — Generating
      </p>
      <h1
        className="text-[#eceef0] text-4xl font-black leading-tight mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Building your skill.
      </h1>
      <p
        className="text-[#888] text-sm mb-10 transition-opacity duration-500"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {MESSAGES[msgIndex]}
      </p>

      {/* Code pane */}
        <div className="border border-[#1a1d20] rounded-[4px] overflow-hidden">
        {/* Header bar */}
        <div
          className="px-4 py-2.5 flex items-center gap-2.5"
          style={{ background: "#0a0d10", borderBottom: "1px solid rgba(245,240,232,0.06)" }}
        >
          <span
            className="w-2 h-2 rounded-full bg-[#5a9e6f] animate-pulse"
            aria-hidden="true"
          />
          <span
            className="text-[#4a5056] text-[11px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SKILL.md
          </span>
        </div>

        {/* Typed content */}
        <div className="bg-[#0d1014] px-5 py-5 min-h-[280px]">
          <code
            className="text-[12.5px] leading-[1.8] block"
            style={{ fontFamily: "var(--font-mono)" }}
            aria-live="polite"
            aria-label="Generating skill content"
          >
            {LINES.slice(0, visibleLines).map((line, i) => (
              <span key={i} className="block text-[#4a4a4a]">
                {line || "\u00a0"}
              </span>
            ))}
            {/* Blinking cursor */}
            {visibleLines <= LINES.length && (
              <span
                className="inline-block w-[7px] h-[14px] bg-[#2e2e2e] animate-pulse align-middle"
                aria-hidden="true"
              />
            )}
          </code>
        </div>
      </div>
    </div>
  );
}
