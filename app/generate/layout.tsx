import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate a SKILL.md — SkillDraft",
  description:
    "Answer targeted questions about your workflow and get a production-ready SKILL.md for Claude Code, Cursor, ChatGPT, Windsurf, Codex CLI, and Gemini CLI in under two minutes.",
  openGraph: {
    title: "Generate a SKILL.md — SkillDraft",
    description:
      "Answer targeted questions about your workflow and get a production-ready SKILL.md for Claude Code, Cursor, ChatGPT, Windsurf, Codex CLI, and Gemini CLI in under two minutes.",
    url: "https://skilldraft.io/generate",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Generate a SKILL.md — SkillDraft",
    description:
      "Answer targeted questions about your workflow and get a production-ready SKILL.md for Claude Code, Cursor, ChatGPT, Windsurf, Codex CLI, and Gemini CLI in under two minutes.",
  },
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
