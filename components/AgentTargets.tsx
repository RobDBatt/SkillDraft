"use client";

/** Shared agent-target chip selector + static badge display. */

export const AGENT_LIST = [
  { id: "claude-code",  label: "Claude Code" },
  { id: "cursor",       label: "Cursor" },
  { id: "windsurf",     label: "Windsurf" },
  { id: "codex-cli",    label: "Codex CLI" },
  { id: "gemini-cli",   label: "Gemini CLI" },
  { id: "copilot",      label: "Copilot" },
] as const;

export type AgentId = (typeof AGENT_LIST)[number]["id"];

// ── Selector (used when creating / saving a skill) ──────────────────────────

interface SelectorProps {
  selected: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

export function AgentTargetSelector({ selected, onChange, label = "Target agents" }: SelectorProps) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]
    );
  }

  return (
    <div>
      <p
        className="text-silver-faint text-[11px] mb-2.5"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label} <span className="opacity-50">(optional)</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {AGENT_LIST.map(agent => {
          const active = selected.includes(agent.id);
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => toggle(agent.id)}
              className={`text-[11px] px-3 py-1 rounded-[3px] border motion-safe:transition-colors focus-visible:outline-none ${
                active
                  ? "border-amber text-amber"
                  : "border-border-dark text-silver-dim hover:border-silver-faint hover:text-silver-mid"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {active ? "✓ " : ""}{agent.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Static badges (used on explore + library cards) ─────────────────────────

interface BadgesProps {
  targets: string[];
  className?: string;
}

export function AgentBadges({ targets, className = "" }: BadgesProps) {
  if (!targets || targets.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {targets.map(t => {
        const match = AGENT_LIST.find(a => a.id === t);
        return (
          <span
            key={t}
            className="text-[10px] px-2 py-0.5 rounded-[2px] bg-amber/10 text-amber border border-amber/20 leading-tight"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {match?.label ?? t}
          </span>
        );
      })}
    </div>
  );
}
