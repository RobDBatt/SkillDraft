import { ImageResponse } from "next/og";

// Brand-accurate social card — light theme, accent #4D9CFF, ink #0E1114,
// mirrors app/skilldraft-system.css tokens.
export const alt =
  "SkillDraft — Quality-scored SKILL.md files for every AI agent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAFAF8",
          backgroundImage:
            "radial-gradient(1100px 520px at 85% -12%, rgba(77,156,255,0.22), transparent 60%)",
          padding: "76px 84px",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 30,
              height: 30,
              background: "#4D9CFF",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 42,
              fontWeight: 700,
              color: "#0E1114",
              letterSpacing: -1,
            }}
          >
            SkillDraft
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 700,
              color: "#0E1114",
              lineHeight: 1.04,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            Quality-scored SKILL.md files for every AI agent
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 33,
              color: "#535C64",
              maxWidth: 900,
            }}
          >
            Generate, score, and security-scan skills for Claude Code, Cursor,
            Windsurf, Codex CLI, and Gemini CLI.
          </div>
        </div>

        {/* footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#0E1114",
              fontFamily: "monospace",
            }}
          >
            npx skilldraft install &lt;id&gt;
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#0E1114",
              color: "#FAFAF8",
              padding: "12px 22px",
              fontSize: 27,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 15,
                height: 15,
                background: "#4D9CFF",
                transform: "rotate(45deg)",
              }}
            />
            <span>scored 92 / 100</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
