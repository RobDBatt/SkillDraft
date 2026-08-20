import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Collections — SkillDraft",
  description:
    "Browse public collections of SKILL.md files grouped by theme. Official and community-curated sets you can copy straight to your AI agent.",
  alternates: { canonical: "https://skilldraft.io/collections" },
  openGraph: {
    title: "Skill Collections — SkillDraft",
    description:
      "Browse public collections of SKILL.md files grouped by theme. Official and community-curated sets you can copy straight to your AI agent.",
    url: "https://skilldraft.io/collections",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Skill Collections — SkillDraft",
    description:
      "Browse public collections of SKILL.md files grouped by theme.",
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
