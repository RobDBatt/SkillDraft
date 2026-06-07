import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — SkillDraft",
  description:
    "Everything you need to know about SKILL.md files and SkillDraft — what they are, how they work, and how to install them on every major AI agent.",
  openGraph: {
    title: "FAQ — SkillDraft",
    description:
      "Everything you need to know about SKILL.md files and SkillDraft — what they are, how they work, and how to install them on every major AI agent.",
    url: "https://skilldraft.io/faq",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FAQ — SkillDraft",
    description:
      "Everything you need to know about SKILL.md files and SkillDraft — what they are, how they work, and how to install them on every major AI agent.",
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
