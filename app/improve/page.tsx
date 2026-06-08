"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { supabase, extractSkillName } from "@/lib/supabase";
import { AgentTargetSelector } from "@/components/AgentTargets";
import { scoreSkill } from "@/lib/scoreSkill";

type Phase = "input" | "streaming" | "done";
type SaveState = "idle" | "saving" | "saved" | "error";

const MAX_INPUT = 10_000;
const DELIMITER = "---NOTES---";

function ImprovePageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [phase,        setPhase]        = useState<Phase>("input");
  const [inputText,    setInputText]    = useState("");
  const [rawAccum,     setRawAccum]     = useState("");
  const [error,        setError]        = useState<string | null>(null);
  const [copied,       setCopied]       = useState(false);
  const [saveState,    setSaveState]    = useState<SaveState>("idle");
  const [agentTargets, setAgentTargets] = useState<string[]>([]);
  const [forkName,     setForkName]     = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Pre-fill from ?from=<skill-id> (fork flow)
  useEffect(() => {
    const fromId = searchParams.get("from");
    if (!fromId) return;
    fetch(`/api/skills/${fromId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.content) {
          setInputText(data.content.slice(0, MAX_INPUT));
          setForkName(data.name ?? null);
          if (data.agent_targets?.length) setAgentTargets(data.agent_targets);
        }
      })
      .catch(() => null);
  }, [searchParams]);

  // Split accumulated stream on the delimiter
  const delimIdx = rawAccum.indexOf(DELIMITER);
  const hasNotes = delimIdx !== -1;
  const skillContent = hasNotes
    ? rawAccum.slice(0, delimIdx).trim()
    : rawAccum;
  const notesRaw = hasNotes
    ? rawAccum.slice(delimIdx + DELIMITER.length).trim()
    : "";

  // Parse note bullets: lines starting with "- "
  const noteLines = notesRaw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const charsLeft = MAX_INPUT - inputText.length;
  const isStreaming = phase === "streaming";

  const handleSubmit = useCallback(async () => {
    if (!inputText.trim() || isStreaming) return;

    setError(null);
    setRawAccum("");
    setPhase("streaming");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch("/api/improve", {
        method: "POST",
        headers,
        body: JSON.stringify({ skill: inputText }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const d = data as { error?: string; creditsEmpty?: boolean };
        setError(d.creditsEmpty
          ? "You're out of credits. Visit /pricing to top up."
          : d.error ?? `Error ${res.status}`
        );
        setPhase("input");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body.");

      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          setRawAccum((prev) => prev + decoder.decode(result.value, { stream: !done }));
        }
      }

      setPhase("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError("Something went wrong. Please try again.");
      setPhase("input");
    }
  }, [inputText, isStreaming]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(skillContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [skillContent]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([skillContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [skillContent]);

  const handleSave = useCallback(async () => {
    if (saveState !== "idle" || !skillContent) return;
    setSaveState("saving");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      setSaveState("idle");
      return;
    }

    const { score } = scoreSkill(skillContent);
    const { error: err } = await supabase.from("skills").insert({
      user_id: user.id,
      name: extractSkillName(skillContent) || "Improved Skill",
      category: "custom-other",
      platform: null,
      content: skillContent,
      source: "improve",
      agent_targets: agentTargets,
      quality_score: score,
    });

    if (err) {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    } else {
      setSaveState("saved");
    }
  }, [saveState, skillContent, router]);

  const handleStartOver = useCallback(() => {
    abortRef.current?.abort();
    setPhase("input");
    setRawAccum("");
    setError(null);
  }, []);

  // ─── Input phase ────────────────────────────────────────────────────────────
  if (phase === "input") {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <SiteNav />
        <main className="flex-1 flex flex-col items-center justify-start pt-16 pb-24 px-6">
          <div className="w-full max-w-2xl">

            <div className="mb-8">
              <p
                className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Skill Improver
              </p>
              <h1
                className="text-headline text-3xl font-black leading-tight mb-3"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Improve your SKILL.md
              </h1>
              <p className="text-silver-muted text-sm leading-relaxed">
                Paste an existing SKILL.md and Claude will rewrite it with sharper
                instructions, better structure, and tighter constraints — then tell you
                exactly what changed.
              </p>
            </div>

            {forkName && (
              <div className="mb-5 flex items-center gap-2 text-[11px] text-silver-dim border border-border-dark rounded-[4px] px-4 py-2.5 bg-surface" style={{ fontFamily: "var(--font-mono)" }}>
                <span className="text-amber">⑂</span>
                <span>Forking: <strong className="text-silver-mid">{forkName}</strong> — edit then improve.</span>
              </div>
            )}

            {error && (
              <div className="mb-5 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-[4px] px-4 py-3">
                {error}
              </div>
            )}

            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) =>
                  setInputText(e.target.value.slice(0, MAX_INPUT))
                }
                placeholder={"# My Workflow\n\nPaste your SKILL.md content here…"}
                className="w-full h-96 bg-surface border border-border-dark rounded-[4px] px-4 py-3.5 text-silver-mid text-[12.5px] leading-[1.75] resize-none focus:outline-none focus:border-silver-dim placeholder:text-silver-faint"
                style={{ fontFamily: "var(--font-mono)" }}
                spellCheck={false}
              />
              <span
                className={`absolute bottom-3 right-3 text-[11px] tabular-nums pointer-events-none ${
                  charsLeft < 500 ? "text-amber" : "text-silver-faint"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {charsLeft.toLocaleString()}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                10 improvements / day · free
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Improve →
              </button>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // ─── Streaming / Done phase ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-20 max-w-6xl mx-auto w-full">

        {/* Page header */}
        <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
          <div>
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {isStreaming ? "Improving…" : "Improved"}
            </p>
            <h1
              className="text-headline text-3xl font-black leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {isStreaming ? "Rewriting your SKILL.md…" : "Your SKILL.md is improved."}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleStartOver}
            className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors focus-visible:outline-none mt-1 shrink-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← Start over
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-6 items-start">

          {/* Left — Improved skill */}
          <div>
            <div
              className="rounded-[4px] overflow-hidden"
              style={{ border: "1px solid var(--color-border-dark)" }}
            >
              {/* Code block header */}
              <div
                className="px-4 py-2.5 flex items-center gap-2.5"
                style={{
                  background: "var(--color-code-header)",
                  borderBottom: "1px solid var(--color-border-dark)",
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isStreaming ? "bg-amber animate-pulse" : "bg-green"}`}
                  aria-hidden="true"
                />
                <span
                  className="text-silver-dim text-[11px]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  SKILL.md
                </span>
              </div>

              {/* Code content */}
              <div className="bg-code-bg px-5 py-5 overflow-x-auto max-h-[600px] overflow-y-auto">
                <pre
                  className="text-silver-mid text-[12.5px] leading-[1.75] whitespace-pre"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {skillContent || (isStreaming ? " " : "")}
                </pre>
              </div>
            </div>

            {/* Agent targets */}
            <div className="mt-5 pt-5 border-t border-border-dark">
              <AgentTargetSelector
                selected={agentTargets}
                onChange={setAgentTargets}
                label="Target agents"
              />
              <p className="text-silver-faint text-[10px] mt-2 leading-snug" style={{ fontFamily: "var(--font-sans)" }}>
                Shown as badges if you share this skill to Explore.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                disabled={isStreaming || !skillContent}
                className="gradient-silver-btn text-sm font-semibold px-5 py-2.5 rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink min-w-[152px] text-center"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {copied ? "Copied ✓" : "Copy to clipboard"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isStreaming || !skillContent}
                className="border border-border-dark text-silver-muted text-sm px-5 py-2.5 rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:border-silver-faint hover:text-silver-lo active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-muted focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Download SKILL.md
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isStreaming || !skillContent || saveState === "saving" || saveState === "saved"}
                className="border border-border-dark text-silver-muted text-sm px-5 py-2.5 rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:border-silver-faint hover:text-silver-lo active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-muted focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {saveState === "saving"
                  ? "Saving…"
                  : saveState === "saved"
                  ? "Saved ✓"
                  : saveState === "error"
                  ? "Save failed"
                  : "Save skill"}
              </button>
            </div>
          </div>

          {/* Right — What changed */}
          <div className="border border-border-dark rounded-[4px] p-6">
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.14em] mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              What changed
            </p>

            {!hasNotes && isStreaming ? (
              <div className="flex flex-col gap-2.5">
                {[70, 90, 60, 80].map((w) => (
                  <div
                    key={w}
                    className="h-3 rounded-sm bg-surface animate-pulse"
                    style={{ width: `${w}%` }}
                  />
                ))}
                <p
                  className="text-silver-faint text-[11px] mt-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Analyzing changes…
                </p>
              </div>
            ) : noteLines.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {noteLines.map((line, i) => {
                  const text = line.startsWith("- ") ? line.slice(2) : line;
                  return (
                    <li
                      key={i}
                      className="text-silver-muted text-xs flex gap-2.5 leading-snug"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      <span className="text-amber shrink-0 mt-px">—</span>
                      {text}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p
                className="text-silver-faint text-xs"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                No change notes returned.
              </p>
            )}

            {phase === "done" && (
              <div className="mt-6 pt-5 border-t border-border-dark">
                <p
                  className="text-silver-muted text-xs leading-relaxed"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Want to improve it further? Copy the output above and paste it
                  back in for another pass.
                </p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default function ImprovePage() {
  return (
    <Suspense fallback={null}>
      <ImprovePageInner />
    </Suspense>
  );
}
