"use client";

// Step 2 — platform selection grid.
// Single-select: click a card to choose and advance to Step 3.

import { platforms, type PlatformId } from "@/lib/platforms";

interface PlatformSelectProps {
  selected: PlatformId | null;
  onSelect: (id: PlatformId) => void;
  onBack: () => void;
}

export default function PlatformSelect({
  selected,
  onSelect,
  onBack,
}: PlatformSelectProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="text-[#777] hover:text-[#888] text-xs transition-colors"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← Back
        </button>
        <span
          className="text-[#e8c87a] text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Step 2 of 5
        </span>
      </div>

      <h1
        className="text-[#eceef0] text-4xl font-black leading-tight mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Which agent?
      </h1>
      <p
        className="text-[#888] text-sm mb-10"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Platform drives the file format, install path, and trigger language.
      </p>

      {/* 4-column grid on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {platforms.map((platform) => {
          const isSelected = selected === platform.id;
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => onSelect(platform.id)}
              className={`text-left p-4 border rounded-[4px] transition-colors ${
                isSelected
                  ? "border-[#9ea2a6] bg-[#0d1014]"
                  : "border-[#252a2e] hover:border-[#6e7478]"
              }`}
            >
              <span
                className={`block text-[13px] font-semibold leading-tight mb-1.5 transition-colors ${
                  isSelected ? "text-[#eceef0]" : "text-[#6e7478] group-hover:text-[#9ea2a6]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {platform.label}
              </span>
              <span
                className={`block text-[9px] leading-snug truncate transition-colors ${
                  isSelected ? "text-[#999]" : "text-[#888]"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {platform.installPath}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
