import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — SkillDraft",
  description: "Sign in to save and manage your SKILL.md files.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
