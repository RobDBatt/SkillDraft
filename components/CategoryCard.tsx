"use client";

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
      className="group relative w-full flex items-center gap-6 py-5 border-b border-border-dark text-left motion-safe:transition-colors motion-safe:duration-150 hover:bg-code-bg hover:pl-[3px] focus-visible:outline-none focus-visible:bg-code-bg"
    >
      {/* Amber left accent on hover */}
      <span
        className="absolute left-0 top-0 h-full w-[3px] bg-amber opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-150"
        aria-hidden="true"
      />

      {/* Number */}
      <span
        className="text-silver-dim text-xs w-5 shrink-0 group-hover:text-silver-muted motion-safe:transition-colors tabular-nums"
        style={{ fontFamily: "var(--font-mono)" }}
        aria-hidden="true"
      >
        {String(index).padStart(2, "0")}
      </span>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <div
          className="text-silver-lo text-[1.05rem] font-bold leading-tight group-hover:text-headline motion-safe:transition-colors"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {category.label}
        </div>
        <div
          className="text-silver-dim text-[13px] mt-0.5 group-hover:text-silver-muted motion-safe:transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {category.description}
        </div>
      </div>

      {/* Arrow */}
      <span
        className="text-silver-faint group-hover:text-amber motion-safe:transition-colors text-sm shrink-0"
        style={{ fontFamily: "var(--font-mono)" }}
        aria-hidden="true"
      >
        →
      </span>
    </button>
  );
}
