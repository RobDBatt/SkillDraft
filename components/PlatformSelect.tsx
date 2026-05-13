"use client";

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
          className="text-[#4a5056] hover:text-[#9ea2a6] text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-[#9ea2a6]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← Back
        </button>
        <span
          className="text-[#e8c87a] text-[10px] font-semibold uppercase tracking-[0.18em]"
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
        className="text-[#6e7478] text-sm mb-10"
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
              className={`text-left p-4 border rounded-[4px] motion-safe:transition-all motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ea2a6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] active:scale-[0.98] ${
                isSelected
                  ? "border-[#9ea2a6] bg-[#0d1014]"
                  : "border-[#1e2428] hover:border-[#3a4048] hover:bg-[#0d1014]"
              }`}
            >
              <span
                className={`block text-[13px] font-semibold leading-tight mb-1.5 motion-safe:transition-colors ${
                  isSelected ? "text-[#eceef0]" : "text-[#9ea2a6] group-hover:text-[#cdd0d3]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {platform.label}
              </span>
              <span
                className={`block text-[9px] leading-snug truncate motion-safe:transition-colors ${
                  isSelected ? "text-[#6e7478]" : "text-[#3a4048]"
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
