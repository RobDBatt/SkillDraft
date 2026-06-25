"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";
import { VERIFY_BANDS, VERIFY_FLAGS, type VerifyStats } from "@/lib/verifyMeta";

type View = "loading" | "denied" | "error" | "ready";

const BAND_COLOR: Record<string, string> = {
  Excellent: "bg-green",
  Good: "bg-amber",
  Fair: "bg-silver-mid",
  Basic: "bg-silver-faint",
};

const FLAG_LABEL: Record<string, string> = {
  injection: "Prompt injection",
  dangerous_command: "Dangerous command",
  exfiltration: "Exfiltration",
  obfuscation: "Obfuscation",
};

function pct(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

export default function StatsPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("loading");
  const [stats, setStats] = useState<VerifyStats | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth?next=/stats");
        return;
      }
      try {
        const res = await fetch("/api/stats", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 403 || res.status === 401) {
          setView("denied");
          return;
        }
        if (!res.ok) {
          setView("error");
          return;
        }
        setStats((await res.json()) as VerifyStats);
        setView("ready");
      } catch {
        setView("error");
      }
    })();
  }, [router]);

  const total = stats?.total ?? 0;
  const outside = stats ? (stats.bands.Fair ?? 0) + (stats.bands.Basic ?? 0) : 0;
  const flaggedTotal = total - (stats?.passed ?? 0);

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-20 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <p
            className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Internal · /verify funnel
          </p>
          <h1
            className="text-headline text-3xl font-black leading-tight mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Verify analytics
          </h1>
          <p className="text-silver-muted text-sm leading-relaxed max-w-2xl">
            Anonymous metadata from every skill verification. The{" "}
            <strong className="text-silver-mid">outside-skill share</strong> below is the
            thesis signal — on-site generation scores 85+, so Fair/Basic runs are skills
            authored elsewhere.
          </p>
        </div>

        {view === "loading" && (
          <p className="text-silver-faint text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            Checking access…
          </p>
        )}

        {view === "denied" && (
          <div className="border border-border-dark rounded-[4px] p-6" style={{ background: "var(--color-surface)" }}>
            <p className="text-silver-mid text-sm font-semibold mb-1">Not authorized</p>
            <p className="text-silver-muted text-xs">
              This dashboard is restricted to SkillDraft admins.
            </p>
          </div>
        )}

        {view === "error" && (
          <div className="border border-border-dark rounded-[4px] p-6" style={{ background: "var(--color-surface)" }}>
            <p className="text-silver-muted text-sm">Stats are temporarily unavailable.</p>
          </div>
        )}

        {view === "ready" && stats && (
          total === 0 ? (
            <div className="border border-border-dark rounded-[4px] p-6" style={{ background: "var(--color-surface)" }}>
              <p className="text-silver-muted text-sm">
                No verification runs recorded yet. Try{" "}
                <a href="/verify" className="text-amber">/verify</a> to generate the first event.
              </p>
            </div>
          ) : (
            <>
              {/* Headline numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total runs", value: total },
                  { label: "Last 7 days", value: stats.last7d },
                  { label: "Outside skills", value: `${pct(outside, total)}%`, accent: true },
                  { label: "Flagged", value: `${pct(flaggedTotal, total)}%` },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="border border-border-dark rounded-[4px] p-4"
                    style={{ background: "var(--color-surface)" }}
                  >
                    <p
                      className={`text-2xl font-black tabular-nums ${s.accent ? "text-amber" : "text-headline"}`}
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {s.value}
                    </p>
                    <p
                      className="text-silver-faint text-[10px] uppercase tracking-[0.12em] mt-1"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Score band distribution */}
              <div className="border border-border-dark rounded-[4px] p-6 mb-6" style={{ background: "var(--color-surface)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-5 text-silver-faint" style={{ fontFamily: "var(--font-mono)" }}>
                  Quality band distribution
                </p>
                <div className="flex flex-col gap-4">
                  {VERIFY_BANDS.map((b) => {
                    const c = stats.bands[b] ?? 0;
                    return (
                      <div key={b}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-silver-mid text-xs" style={{ fontFamily: "var(--font-sans)" }}>{b}</span>
                          <span className="text-silver-faint text-[11px] tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                            {c} · {pct(c, total)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-code-bg overflow-hidden">
                          <div className={`h-full rounded-full ${BAND_COLOR[b]}`} style={{ width: `${pct(c, total)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sources + flagged breakdown */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="border border-border-dark rounded-[4px] p-6" style={{ background: "var(--color-surface)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-4 text-silver-faint" style={{ fontFamily: "var(--font-mono)" }}>
                    Source
                  </p>
                  <ul className="flex flex-col gap-2 text-xs text-silver-muted" style={{ fontFamily: "var(--font-mono)" }}>
                    <li className="flex justify-between"><span>Web (page)</span><span className="tabular-nums">{stats.web}</span></li>
                    <li className="flex justify-between"><span>API (CI)</span><span className="tabular-nums">{stats.api}</span></li>
                  </ul>
                </div>

                <div className="border border-border-dark rounded-[4px] p-6" style={{ background: "var(--color-surface)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-4 text-silver-faint" style={{ fontFamily: "var(--font-mono)" }}>
                    Security flags
                  </p>
                  {flaggedTotal === 0 ? (
                    <p className="text-silver-faint text-xs" style={{ fontFamily: "var(--font-sans)" }}>None flagged yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-2 text-xs text-silver-muted" style={{ fontFamily: "var(--font-mono)" }}>
                      {VERIFY_FLAGS.map((f) => (
                        <li key={f} className="flex justify-between">
                          <span>{FLAG_LABEL[f]}</span>
                          <span className="tabular-nums">{stats.flags[f] ?? 0}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
}
