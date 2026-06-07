"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-ink min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <p
          className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-6"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Something went wrong
        </p>
        <h1
          className="text-headline text-3xl font-black leading-tight mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Unexpected error.
        </h1>
        <p
          className="text-silver-muted text-sm mb-8 leading-relaxed"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {error.message || "An unexpected error occurred. Try again or go back to the start."}
        </p>
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={reset}
            className="gradient-silver-btn text-sm font-semibold px-5 py-2.5 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-silver-dim hover:text-silver-mid text-sm motion-safe:transition-colors focus-visible:outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Go home →
          </Link>
        </div>
      </div>
    </div>
  );
}
