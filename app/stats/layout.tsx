import type { Metadata } from "next";

// Internal dashboard — keep it out of search indexes.
export const metadata: Metadata = {
  title: "Verify analytics — SkillDraft",
  robots: { index: false, follow: false },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
