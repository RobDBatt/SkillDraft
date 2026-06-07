import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Skills — SkillDraft",
  description:
    "Browse community-shared SKILL.md files. Find skills for development, frontend, content writing, data integrations, and more — copy any skill directly to your AI agent.",
  openGraph: {
    title: "Explore Skills — SkillDraft",
    description:
      "Browse community-shared SKILL.md files. Find skills for development, frontend, content writing, data integrations, and more.",
    url: "https://skilldraft.io/explore",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Explore Skills — SkillDraft",
    description:
      "Browse community-shared SKILL.md files. Copy any skill directly to your AI agent.",
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
