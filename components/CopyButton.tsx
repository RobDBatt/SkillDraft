"use client";

import { useState } from "react";

/** Inline copy-to-clipboard glyph used by the hero command chip. */
export function CopyButton({ text, title = "Copy" }: { text: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <span
      className="copy"
      role="button"
      tabIndex={0}
      title={title}
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigator.clipboard?.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }
      }}
    >
      {copied ? "✓" : "⧉"}
    </span>
  );
}
