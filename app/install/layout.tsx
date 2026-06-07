import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Installation Guide — SkillDraft",
  description:
    "Step-by-step installation paths for every AI agent: Claude Code, Cursor, GitHub Copilot, ChatGPT, Windsurf, Codex CLI, and Gemini CLI.",
  openGraph: {
    title: "Installation Guide — SkillDraft",
    description:
      "Step-by-step installation paths for every AI agent: Claude Code, Cursor, GitHub Copilot, ChatGPT, Windsurf, Codex CLI, and Gemini CLI.",
    url: "https://skilldraft.io/install",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Installation Guide — SkillDraft",
    description:
      "Step-by-step installation paths for every AI agent: Claude Code, Cursor, GitHub Copilot, ChatGPT, Windsurf, Codex CLI, and Gemini CLI.",
  },
};

export default function InstallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
