"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";

type LoadingKey = "starter" | "standard" | "power" | "pro" | null;

const PACKS = [
  { key: "starter",  credits: 20,  price: 4,  label: "Starter",  per: "20¢ / credit" },
  { key: "standard", credits: 75,  price: 12, label: "Standard", per: "16¢ / credit", popular: true },
  { key: "power",    credits: 200, price: 25, label: "Power",    per: "12¢ / credit" },
] as const;

export default function PricingPage() {
  const [credits,   setCredits]   = useState<number | null>(null);
  const [loggedIn,  setLoggedIn]  = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState<LoadingKey>(null);
  const [proActive, setProActive] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("success") === "true") {
      setSuccess(true);
      window.history.replaceState({}, "", "/pricing");
    }

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setLoggedIn(true);
      const { data } = await supabase
        .from("profiles")
        .select("credits, subscription_status")
        .eq("id", user.id)
        .single();
      if (data) {
        setCredits(data.credits);
        setProActive(data.subscription_status === "active");
      }
    });
  }, []);

  async function handleCheckout(type: "pack" | "pro", pack?: string) {
    const key = type === "pro" ? "pro" : (pack as LoadingKey);
    setLoading(key);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = `/auth?next=/pricing`;
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type, pack }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-16 pb-24 max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="mb-12 text-center">
          <p
            className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Pricing
          </p>
          <h1
            className="text-headline text-4xl font-black leading-tight mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Pay only for what you use.
          </h1>
          <p className="text-silver-muted text-sm max-w-sm mx-auto">
            1 credit = 1 generation or 1 improvement. Start free, top up when you need more.
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-8 bg-green/10 border border-green/30 rounded-[4px] px-5 py-4 text-center">
            <p className="text-green text-sm font-semibold">Payment successful — credits added to your account.</p>
            {loggedIn && (
              <Link href="/skills" className="text-silver-muted text-xs mt-1 block hover:text-silver-mid motion-safe:transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
                View your skills →
              </Link>
            )}
          </div>
        )}

        {/* Current balance */}
        {loggedIn && credits !== null && (
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="border border-border-dark rounded-[4px] px-6 py-3 flex items-center gap-3">
              <span className="text-silver-muted text-xs" style={{ fontFamily: "var(--font-mono)" }}>Your balance</span>
              <span className="text-headline text-lg font-black" style={{ fontFamily: "var(--font-serif)" }}>
                {credits} {credits === 1 ? "credit" : "credits"}
              </span>
              {proActive && (
                <span className="text-amber text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)" }}>
                  Pro
                </span>
              )}
            </div>
          </div>
        )}

        {/* Free tier */}
        <div className="mb-10 border border-border-dark rounded-[4px] p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Free
              </p>
              <p className="text-headline text-xl font-black mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                5 credits on signup
              </p>
              <p className="text-silver-muted text-sm">
                Enough to generate and improve a full SKILL.md. No card required.
              </p>
            </div>
            {!loggedIn && (
              <Link
                href="/auth"
                className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] shrink-0 motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Get started →
              </Link>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border-dark flex flex-wrap gap-x-8 gap-y-2">
            {["5 credits included", "1 credit per generation", "1 credit per improvement", "Skill saves included"].map(f => (
              <span key={f} className="text-silver-muted text-xs flex items-center gap-2" style={{ fontFamily: "var(--font-sans)" }}>
                <span className="text-green">✓</span> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Pro monthly */}
        <div className="mb-6 border border-amber/30 rounded-[4px] p-6 relative" style={{ background: "var(--accent-soft)" }}>
          <div className="absolute -top-3 left-5">
            <span className="bg-amber text-ink text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-[2px]" style={{ fontFamily: "var(--font-mono)" }}>
              Most popular
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
            <div>
              <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Pro
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-headline text-3xl font-black" style={{ fontFamily: "var(--font-serif)" }}>$5</span>
                <span className="text-silver-muted text-sm">/month</span>
              </div>
              <p className="text-silver-muted text-sm">50 credits added every month. Cancel any time.</p>
            </div>
            <button
              type="button"
              onClick={() => handleCheckout("pro")}
              disabled={loading !== null || proActive}
              className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {proActive ? "Active ✓" : loading === "pro" ? "Redirecting…" : "Subscribe →"}
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-amber/20 flex flex-wrap gap-x-8 gap-y-2">
            {["50 credits / month", "Credits roll over", "10¢ per credit", "Cancel anytime"].map(f => (
              <span key={f} className="text-silver-muted text-xs flex items-center gap-2" style={{ fontFamily: "var(--font-sans)" }}>
                <span className="text-amber">✓</span> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Credit packs */}
        <p className="text-silver-dim text-[11px] uppercase tracking-[0.14em] mb-4" style={{ fontFamily: "var(--font-mono)" }}>
          One-time top-ups
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {PACKS.map(pack => (
            <div key={pack.key} className="border border-border-dark rounded-[4px] p-5 flex flex-col gap-4">
              <div>
                <p className="text-silver-muted text-[11px] uppercase tracking-[0.14em] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                  {pack.label}
                </p>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-headline text-2xl font-black" style={{ fontFamily: "var(--font-serif)" }}>${pack.price}</span>
                </div>
                <p className="text-silver-muted text-xs">{pack.credits} credits · {pack.per}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCheckout("pack", pack.key)}
                disabled={loading !== null}
                className="mt-auto border border-border-dark2 text-silver-muted text-xs px-4 py-2 rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed motion-safe:transition-all motion-safe:duration-200 hover:border-silver-faint hover:text-silver-lo active:scale-[0.98]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {loading === pack.key ? "Redirecting…" : `Buy ${pack.credits} credits →`}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-center text-silver-faint text-xs" style={{ fontFamily: "var(--font-sans)" }}>
          Credits never expire. Unused credits carry forward forever. Questions?{" "}
          <a href="mailto:hi@skilldraft.io" className="text-silver-dim hover:text-silver-mid motion-safe:transition-colors">
            hi@skilldraft.io
          </a>
        </p>

      </main>
    </div>
  );
}
