"use client";

// Renders a single numbered row in the Step 1 category list.
// Click → select and advance to Step 2. Not a card grid.

import type { CategoryConfig } from "@/lib/questions";

interface CategoryCardProps {
  category: CategoryConfig;
  index: number;
  selected: boolean;
  onSelect: (id: CategoryConfig["id"]) => void;
}

export default function CategoryCard({
  category,
  index,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className="group relative w-full flex items-center gap-6 py-5 border-b border-[#1a1d20] text-left transition-colors hover:bg-[#0d1014] hover:pl-[3px]"
    >
      {/* Cream left accent on hover */}
      <span className="absolute left-0 top-0 h-full w-[3px] bg-[#e8c87a] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />

      {/* Number */}
      <span
        className="text-[#4a5056] text-xs w-5 shrink-0 group-hover:text-[#6e7478] transition-colors tabular-nums"
        style={{ fontFamily: "var(--font-mono)" }}
        aria-hidden="true"
      >
        {String(index).padStart(2, "0")}
      </span>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[#9ea2a6] text-[1.05rem] font-bold leading-tight group-hover:text-[#eceef0] transition-colors"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {category.label}
        </div>
        <div
          className="text-[#4a5056] text-[13px] mt-0.5 group-hover:text-[#6e7478] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {category.description}
        </div>
      </div>

      {/* Arrow */}
      <span
        className="text-[#888] group-hover:text-[#888] transition-colors text-sm shrink-0"
        style={{ fontFamily: "var(--font-mono)" }}
        aria-hidden="true"
      >
        →
      </span>
    </button>
  );
}
