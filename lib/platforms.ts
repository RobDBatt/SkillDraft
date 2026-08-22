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
    installPath: ".cursor/skills/[name]/SKILL.md",
    installNote:
      "Cursor discovers skills from .cursor/skills/ or .agents/skills/ in the project, and ~/.cursor/skills/ or ~/.agents/skills/ globally. The folder name must match the skill's name field. Cursor rules (.cursor/rules/*.mdc) are a separate system for short standing constraints — a SKILL.md does not belong there.",
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    installPath: ".github/skills/[name]/SKILL.md",
    installNote:
      "Copilot agent skills work in the Copilot cloud agent, code review, Copilot CLI, the Copilot app, and agent mode in VS Code and JetBrains IDEs. Personal skills go in ~/.copilot/skills/.",
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
    installPath: ".agents/skills/[name]/SKILL.md",
    installNote:
      "Windsurf's Cascade reads skills from .agents/skills/ and ~/.agents/skills/, and from .claude/skills/ when Claude Code config reading is enabled. Windsurf rules (.windsurf/rules/) are a separate system for short behavioural constraints — use a skill when the workflow needs supporting files.",
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
    installPath: "Compatible with Claude Code, GitHub Copilot, Cursor, Windsurf, Codex, Gemini CLI",
    installNote: "Uses the most compatible format across all agents.",
  },
];

export function getPlatformById(id: PlatformId): PlatformConfig | undefined {
  return platforms.find((p) => p.id === id);
}
