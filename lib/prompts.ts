// Category-specific system prompts for the Anthropic API call.
// Each prompt tells Claude how to generate a SKILL.md for that domain.

import type { Category } from "./questions";
import type { PlatformId } from "./platforms";

const BASE_RULES = `You are an expert at writing SKILL.md files for AI coding agents.
You follow the agentskills.io open standard exactly.
Generate a complete, production-ready SKILL.md file based on the user's answers.

Rules:
- The description must be specific enough to auto-trigger correctly
- Front-load the key use case and trigger words in the description
- Include "do not" instructions to prevent Claude from defaulting to generic behavior
- Keep the full instructions under 5,000 tokens
- Use the exact YAML frontmatter format: name, description (required), plus optional fields
- The name must be: lowercase, alphanumeric and dashes only, max 64 chars
- Do not include markdown fences in your output — return raw SKILL.md content only`;

const CATEGORY_CONTEXT: Record<Category, string> = {
  development: `Category context: Software Development
This skill automates repetitive developer tasks (git, code review, tests, scaffolding, refactoring, docs).
The description should trigger when the user mentions the specific language/framework and task type.
Include concrete code conventions and hard stops in the instructions.`,

  "frontend-design": `Category context: Frontend & Design
This skill covers UI component creation, design system work, and layout patterns.
The description should trigger on frontend-specific requests (component names, design tokens, responsive fixes).
Always embed the stack and any design system rules directly into the instructions.`,

  "content-writing": `Category context: Content & Writing
This skill covers copywriting, technical docs, SEO content, and editorial work.
The description should trigger on content-creation requests matching the specified content types.
Voice and tone rules must be explicit and example-driven in the instructions.`,

  "data-integrations": `Category context: Data & Integrations
This skill covers ETL pipelines, API integrations, database queries, and spreadsheet automation.
The description should trigger when the user mentions the specific tools (e.g. "PostgreSQL", "REST API").
Data format and error handling rules are critical — include them verbatim from user input.`,

  "project-workflows": `Category context: Project Workflows
This skill manages structured development lifecycle phases (spec, plan, build, review, deploy).
The description should trigger on workflow-initiating phrases ("write a spec", "plan this feature", "kick off").
Gates and checkpoints must be enforced as explicit step-by-step instructions.`,

  "custom-other": `Category context: Custom / Other
This is a free-form skill covering any domain not listed above.
The description must include the trigger phrases the user specified verbatim.
Be extra careful to scope the instructions tightly — custom skills risk being too broad.`,
};

const PLATFORM_CONTEXT: Record<PlatformId, string> = {
  "claude-code": `Platform: Claude Code
Install path: ~/.claude/skills/[name]/SKILL.md
Format: Standard SKILL.md with YAML frontmatter (name, description, triggers fields).
Trigger language: Claude Code activates skills based on description matching and trigger phrases.`,

  cursor: `Platform: Cursor
Install path: .cursor/rules/[name].mdc
Format: MDC format — use YAML frontmatter with description field. Rules can be "always" or pattern-matched.
Trigger language: Cursor rules are pattern-matched to file types or always-on.`,

  "github-copilot": `Platform: GitHub Copilot
Install path: .github/copilot-instructions.md
Format: Markdown instructions file — no YAML frontmatter required. Use clear headings and bullet points.
Note: Copilot reads one global instructions file per repo. Scope the skill accordingly.`,

  chatgpt: `Platform: ChatGPT
Install path: Pasted into Settings → Customize ChatGPT → Custom instructions
Format: Plain text or minimal markdown. No YAML frontmatter. Focus on the instructions section only.
Trigger language: ChatGPT applies custom instructions to every conversation.`,

  windsurf: `Platform: Windsurf
Install path: .windsurf/rules/[name].md
Format: Markdown file with frontmatter. Similar to Cursor MDC rules.
Trigger language: Windsurf rules can be always-on or triggered by file patterns.`,

  codex: `Platform: Codex CLI
Install path: ~/.codex/skills/[name]/SKILL.md
Format: Standard SKILL.md with YAML frontmatter. Same format as Claude Code.
Trigger language: Codex activates skills from the description and trigger phrases.`,

  "gemini-cli": `Platform: Gemini CLI
Install path: ~/.gemini/skills/[name]/SKILL.md
Format: Standard SKILL.md with YAML frontmatter. Compatible with agentskills.io standard.
Trigger language: Gemini CLI matches skill descriptions to user intent.`,

  universal: `Platform: Universal (multi-agent compatible)
This skill must work across Claude Code, Cursor, Windsurf, Codex CLI, and Gemini CLI.
Format: Use the standard agentskills.io SKILL.md format with YAML frontmatter.
Avoid platform-specific syntax. Keep instructions generic enough to be useful across all agents.`,
};

export function getSystemPrompt(
  category: Category,
  platform: PlatformId | null
): string {
  const platformSection = platform
    ? `\n\n${PLATFORM_CONTEXT[platform]}`
    : "";
  return `${BASE_RULES}\n\n${CATEGORY_CONTEXT[category]}${platformSection}`;
}
