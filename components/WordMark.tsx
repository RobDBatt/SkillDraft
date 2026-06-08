/**
 * SkillDraft wordmark — Sk◆llDraft with a dotless-i (ı, U+0131) whose CSS
 * diamond becomes the i-dot, and "Draft" in the brand accent. No interactivity,
 * no bot mark — safe to import from server and client components and to nest
 * inside an existing link. For the full animated mark, use <Logo />.
 */
export function WordMark() {
  return (
    <span className="logo">
      <span className="wm">
        Sk<span className="dot-i">{"ı"}</span>ll<i>Draft</i>
      </span>
    </span>
  );
}
