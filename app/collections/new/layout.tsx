import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Collection — SkillDraft",
  robots: { index: false, follow: false },
};

export default function NewCollectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
