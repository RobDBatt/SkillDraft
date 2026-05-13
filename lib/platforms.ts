// Platform configs for Step 2 of the SkillDraft wizard.
// Each platform has a unique install path and optional note for the output tips panel.

export type PlatformId =
  | "claude-code"
  | "cursor"
  | "github-copilot"
  | "chatgpt"
  | "windsurf"
  | "codex"
  | "gemini-cli"
  | "universal";

export interface PlatformConfig {
  id: PlatformId;
  label: string;
  installPath: string;
  installNote?: string;
}

export const platforms: PlatformConfig[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    installPath: "~/.claude/skills/[name]/SKILL.md",
  },
  {
    id: "cursor",
    label: "Cursor",
    installPath: ".cursor/rules/[name].mdc",
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    installPath: ".github/copilot-instructions.md",
    installNote: "Copilot reads one global instructions file per repo.",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    installPath: "Settings → Customize ChatGPT → Custom instructions",
    installNote: "Paste the instructions section into Custom instructions.",
  },
  {
    id: "windsurf",
    label: "Windsurf",
    installPath: ".windsurf/rules/[name].md",
  },
  {
    id: "codex",
    label: "Codex CLI",
    installPath: "~/.codex/skills/[name]/SKILL.md",
  },
  {
    id: "gemini-cli",
    label: "Gemini CLI",
    installPath: "~/.gemini/skills/[name]/SKILL.md",
  },
  {
    id: "universal",
    label: "Universal",
    installPath: "Compatible with Claude Code, Cursor, Windsurf, Codex, Gemini CLI",
    installNote: "Uses the most compatible format across all agents.",
  },
];

export function getPlatformById(id: PlatformId): PlatformConfig | undefined {
  return platforms.find((p) => p.id === id);
}
