import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams — SkillDraft",
  robots: { index: false, follow: false },
};

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
