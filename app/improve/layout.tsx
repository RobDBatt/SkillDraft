import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Improve a SKILL.md — SkillDraft",
  description:
    "Paste your existing SKILL.md and get an AI-powered rewrite with sharper instructions, better structure, tighter constraints — plus a summary of every change made.",
  openGraph: {
    title: "Improve a SKILL.md — SkillDraft",
    description:
      "Paste your existing SKILL.md and get an AI-powered rewrite with sharper instructions, better structure, tighter constraints — plus a summary of every change made.",
    url: "https://skilldraft.io/improve",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Improve a SKILL.md — SkillDraft",
    description:
      "Paste your existing SKILL.md and get an AI-powered rewrite with sharper instructions, better structure, tighter constraints — plus a summary of every change made.",
  },
};

export default function ImproveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
