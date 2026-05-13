"use client";

import { useEffect, useState } from "react";

// Syntax-colored lines matching the code preview aesthetic on the landing page
const LINES: Array<{ text: string; color: string }> = [
  { text: "---",                               color: "#3a4048" },
  { text: "name: your-skill",                  color: "#e8c87a" },
  { text: "description: |",                    color: "#e8c87a" },
  { text: "  Triggers when you need to...",    color: "#9ea2a6" },
  { text: "  Detects intent from keywords...", color: "#9ea2a6" },
  { text: "  Scoped to your workflow only.",   color: "#9ea2a6" },
  { text: "---",                               color: "#3a4048" },
  { text: "",                                  color: "#3a4048" },
  { text: "# Your Skill",                      color: "#eceef0" },
  { text: "",                                  color: "#3a4048" },
  { text: "## When to use this",               color: "#e8c87a" },
  { text: "- Activated by trigger phrases",    color: "#6e7478" },
  { text: "- Scoped to your workflow",         color: "#6e7478" },
  { text: "",                                  color: "#3a4048" },
  { text: "## Instructions",                   color: "#e8c87a" },
  { text: "- Follow the rules you defined",    color: "#6e7478" },
  { text: "- Never do what you said to avoid", color: "#6e7478" },
  { text: "",                                  color: "#3a4048" },
  { text: "## Hard stops",                     color: "#e8c87a" },
  { text: "- Never bypass the gates you set",  color: "#6e7478" },
];

const MESSAGES = [
  "Drafting your skill...",
  "Checking trigger description...",
  "Finalising instructions...",
];

export default function GeneratingState() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (visibleLines >= LINES.length) return;
    const delay = visibleLines < 7 ? 90 : 130;
    const t = setTimeout(() => setVisibleLines((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [visibleLines]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((n) => Math.min(n + 1, MESSAGES.length - 1));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p
        className="text-[#e8c87a] text-[10px] font-semibold uppercase tracking-[0.18em] mb-8"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Step 4 of 5 — Generating
      </p>
      <h1
        className="text-[#eceef0] text-4xl font-black leading-tight mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Building your skill.
      </h1>
      <p
        className="text-[#6e7478] text-sm mb-10"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {MESSAGES[msgIndex]}
      </p>

      {/* Code pane */}
      <div
        className="rounded-[4px] overflow-hidden"
        style={{ border: "1px solid rgba(245,240,232,0.08)" }}
      >
        {/* Header bar */}
        <div
          className="px-4 py-2.5 flex items-center gap-2.5"
          style={{ background: "#0a0d10", borderBottom: "1px solid rgba(245,240,232,0.06)" }}
        >
          <span
            className="w-2 h-2 rounded-full bg-[#5a9e6f] animate-pulse flex-shrink-0"
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
              <span key={i} className="block" style={{ color: line.color }}>
                {line.text || " "}
              </span>
            ))}
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
