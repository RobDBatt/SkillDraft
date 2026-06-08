"use client";

import { useEffect, useState } from "react";

// Syntax-colored lines matching the code preview aesthetic on the landing page
const LINES: Array<{ text: string; color: string }> = [
  { text: "---",                               color: "var(--color-silver-faint)" },
  { text: "name: your-skill",                  color: "var(--color-amber)" },
  { text: "description: |",                    color: "var(--color-amber)" },
  { text: "  Triggers when you need to...",    color: "var(--color-silver-mid)" },
  { text: "  Detects intent from keywords...", color: "var(--color-silver-mid)" },
  { text: "  Scoped to your workflow only.",   color: "var(--color-silver-mid)" },
  { text: "---",                               color: "var(--color-silver-faint)" },
  { text: "",                                  color: "var(--color-silver-faint)" },
  { text: "# Your Skill",                      color: "var(--color-headline)" },
  { text: "",                                  color: "var(--color-silver-faint)" },
  { text: "## When to use this",               color: "var(--color-amber)" },
  { text: "- Activated by trigger phrases",    color: "var(--color-silver-muted)" },
  { text: "- Scoped to your workflow",         color: "var(--color-silver-muted)" },
  { text: "",                                  color: "var(--color-silver-faint)" },
  { text: "## Instructions",                   color: "var(--color-amber)" },
  { text: "- Follow the rules you defined",    color: "var(--color-silver-muted)" },
  { text: "- Never do what you said to avoid", color: "var(--color-silver-muted)" },
  { text: "",                                  color: "var(--color-silver-faint)" },
  { text: "## Hard stops",                     color: "var(--color-amber)" },
  { text: "- Never bypass the gates you set",  color: "var(--color-silver-muted)" },
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
        className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-8"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Step 4 of 5 — Generating
      </p>
      <h1
        className="text-headline text-4xl font-black leading-tight mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Building your skill.
      </h1>
      <p
        className="text-silver-muted text-sm mb-10"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {MESSAGES[msgIndex]}
      </p>

      {/* Code pane */}
      <div
        className="rounded-[4px] overflow-hidden"
        style={{ border: "1px solid var(--color-border-dark)" }}
      >
        {/* Header bar */}
        <div
          className="px-4 py-2.5 flex items-center gap-2.5"
          style={{ background: "var(--color-code-header)", borderBottom: "1px solid var(--color-border-dark)" }}
        >
          <span
            className="w-2 h-2 rounded-full bg-green animate-pulse flex-shrink-0"
            aria-hidden="true"
          />
          <span
            className="text-silver-dim text-[11px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SKILL.md
          </span>
        </div>

        {/* Typed content */}
        <div className="bg-code-bg px-5 py-5 min-h-[280px]">
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
                className="inline-block w-[7px] h-[14px] bg-silver-mid animate-pulse align-middle"
                aria-hidden="true"
              />
            )}
          </code>
        </div>
      </div>
    </div>
  );
}
