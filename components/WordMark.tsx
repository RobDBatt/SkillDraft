/**
 * Two-tone wordmark: editorial serif 'Skill' + technical mono 'Draft'.
 * No interactivity — safe to import from server and client components.
 */
export function WordMark() {
  return (
    <span className="flex items-center">
      <span
        className="gradient-silver-text text-xl font-black tracking-tight leading-none"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Skill
      </span>
      <span
        className="text-silver-muted text-base font-medium tracking-wide leading-none"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Draft
      </span>
    </span>
  );
}
