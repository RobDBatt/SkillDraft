"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

/** Hero entry-point link to /verify, with a click event for funnel attribution. */
export function VerifyHeroLink() {
  return (
    <Link
      href="/verify"
      onClick={() => track("verify_entry_click", { source: "homepage_hero" })}
    >
      Verify any SKILL.md, free →
    </Link>
  );
}
