import Link from "next/link";
import { WordMark } from "./WordMark";

/** Shared site nav — used on landing, install, and FAQ pages. */
export function SiteNav() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-border-dark backdrop-blur-md"
      style={{ background: "rgba(10,10,10,0.82)" }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between gap-4">

        {/* Left: logo + nav links */}
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <Link href="/" aria-label="SkillDraft home" className="shrink-0">
            <WordMark />
          </Link>
          {/* Hide on xs, show on sm+ to prevent overflow */}
          <div className="hidden sm:flex items-center gap-5 lg:gap-6">
            <Link
              href="/pricing"
              className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-silver-mid"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Pricing
            </Link>
            <Link
              href="/improve"
              className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-silver-mid"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Improve
            </Link>
            <Link
              href="/skills"
              className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-silver-mid"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              My Skills
            </Link>
            <Link
              href="/install"
              className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-silver-mid"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Install
            </Link>
            <Link
              href="/faq"
              className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-silver-mid"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Right: Generate CTA */}
        <Link
          href="/generate"
          className="gradient-silver-btn text-xs font-semibold px-4 py-2 rounded-[4px] shrink-0 motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Generate →
        </Link>

      </div>
    </nav>
  );
}
