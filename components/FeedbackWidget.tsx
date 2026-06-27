"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

const KINDS = [
  { value: "request", label: "Feature request" },
  { value: "recommendation", label: "Recommendation" },
  { value: "bug", label: "Bug report" },
  { value: "other", label: "Other" },
] as const;

type SubmitState = "idle" | "sending" | "sent" | "error";

/** Site-wide floating feedback button + message box. Posts to /api/feedback. */
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>("request");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [state, setState] = useState<SubmitState>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "sending" || !message.trim()) return;
    setState("sending");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers,
        body: JSON.stringify({ kind, message, email, hp }),
      });
      if (!res.ok) throw new Error("request failed");

      setState("sent");
      setMessage("");
      setEmail("");
      setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 2200);
    } catch {
      setState("error");
    }
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-[60] flex flex-col items-end"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Send feedback"
          className="mb-3 w-[320px] max-w-[calc(100vw-2.5rem)] border border-border-dark rounded-[6px] bg-ink shadow-xl p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p
                className="text-headline text-sm font-black"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Requests &amp; feedback
              </p>
              <p className="text-silver-muted text-xs mt-0.5">
                Suggest a category, report a bug, tell us anything.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close feedback"
              className="text-silver-dim hover:text-silver-mid text-sm leading-none p-1 -mr-1 -mt-1"
            >
              ✕
            </button>
          </div>

          {state === "sent" ? (
            <p className="text-green text-sm py-6 text-center">Thanks — got it. 🙏</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {KINDS.map((k) => (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => setKind(k.value)}
                    className={`text-[11px] px-2.5 py-1 rounded-[3px] border motion-safe:transition-colors ${
                      kind === k.value
                        ? "border-amber text-amber"
                        : "border-border-dark text-silver-muted hover:text-silver-lo"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {k.label}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={5000}
                rows={4}
                placeholder="What would you like to see, or what went wrong?"
                className="w-full resize-none bg-code-bg border border-border-dark rounded-[4px] px-3 py-2 text-sm text-silver-mid placeholder:text-silver-faint focus:outline-none focus:border-silver-faint"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional, for a reply)"
                className="w-full bg-code-bg border border-border-dark rounded-[4px] px-3 py-2 text-sm text-silver-mid placeholder:text-silver-faint focus:outline-none focus:border-silver-faint"
              />

              {/* Honeypot — hidden from real users, catches naive bots. Name is
                  deliberately non-semantic so browser/password-manager autofill
                  won't populate it and drop a real submission. */}
              <input
                type="text"
                name="contact_reason_alt"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="hidden"
              />

              {state === "error" && (
                <p className="text-red-400 text-xs">Couldn’t send — please try again.</p>
              )}

              <button
                type="submit"
                disabled={state === "sending" || !message.trim()}
                className="gradient-silver-btn text-xs font-semibold px-4 py-2 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {state === "sending" ? "Sending…" : "Send feedback →"}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close feedback" : "Send feedback"}
        aria-expanded={open}
        className="flex items-center gap-2 gradient-silver-btn text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.03] active:scale-[0.97]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span aria-hidden="true">💬</span> Feedback
      </button>
    </div>
  );
}
