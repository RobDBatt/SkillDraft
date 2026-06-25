import { SiteNav } from "@/components/SiteNav";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { VERIFY_BANDS, VERIFY_FLAGS } from "@/lib/verifyMeta";

// Always read fresh; never prerender (depends on the DB and runtime secrets).
export const dynamic = "force-dynamic";

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

interface Stats {
  total: number;
  passed: number;
  web: number;
  api: number;
  last7d: number;
  bands: Record<string, number>;
  flags: Record<string, number>;
}

async function getStats(): Promise<Stats | null> {
  try {
    const tbl = () => supabaseAdmin.from("verify_events");
    const exact = { count: "exact" as const, head: true };
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

    const [total, passed, web, api, last7d] = await Promise.all([
      tbl().select("*", exact),
      tbl().select("*", exact).eq("passed", true),
      tbl().select("*", exact).eq("source", "web"),
      tbl().select("*", exact).eq("source", "api"),
      tbl().select("*", exact).gt("created_at", weekAgo),
    ]);

    const bandCounts = await Promise.all(
      VERIFY_BANDS.map((b) => tbl().select("*", exact).eq("band", b))
    );
    const flagCounts = await Promise.all(
      VERIFY_FLAGS.map((f) => tbl().select("*", exact).eq("flagged_for", f))
    );

    const bands: Record<string, number> = {};
    VERIFY_BANDS.forEach((b, i) => (bands[b] = bandCounts[i].count ?? 0));
    const flags: Record<string, number> = {};
    VERIFY_FLAGS.forEach((f, i) => (flags[f] = flagCounts[i].count ?? 0));

    return {
      total: total.count ?? 0,
      passed: passed.count ?? 0,
      web: web.count ?? 0,
      api: api.count ?? 0,
      last7d: last7d.count ?? 0,
      bands,
      flags,
    };
  } catch {
    return null;
  }
}

function pct(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

export default async function StatsPage() {
  const stats = await getStats();

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

        {stats === null ? (
          <div className="border border-border-dark rounded-[4px] p-6" style={{ background: "var(--color-surface)" }}>
            <p className="text-silver-muted text-sm">
              Stats are temporarily unavailable (data source unreachable).
            </p>
          </div>
        ) : total === 0 ? (
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
        )}
      </main>
    </div>
  );
}
