import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Skills — SkillDraft",
  description: "Your saved SKILL.md files.",
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
