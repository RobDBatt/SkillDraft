"use client";

import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";

type Phase = "form" | "sent";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setPhase("sent");
    }
  }

  if (phase === "sent") {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <SiteNav />
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
          <div className="w-full max-w-sm text-center">
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Check your inbox
            </p>
            <h1
              className="text-headline text-2xl font-black mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Magic link sent.
            </h1>
            <p className="text-silver-muted text-sm leading-relaxed">
              We sent a sign-in link to{" "}
              <span className="text-silver-mid">{email}</span>. Click it to
              access your saved skills — no password needed.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Sign in
            </p>
            <h1
              className="text-headline text-2xl font-black mb-3"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Save your skills.
            </h1>
            <p className="text-silver-muted text-sm">
              No password. We&apos;ll email you a magic link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-[4px] px-4 py-3">
                {error}
              </div>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full bg-surface border border-border-dark rounded-[4px] px-4 py-3 text-silver-mid text-sm focus:outline-none focus:border-silver-dim placeholder:text-silver-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="gradient-silver-btn text-sm font-semibold py-2.5 rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-mid focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {loading ? "Sending…" : "Send magic link →"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
