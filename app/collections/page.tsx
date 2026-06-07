"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";

type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_official: boolean;
  is_public: boolean;
  created_at: string;
  skill_count?: number;
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("collections")
        .select("*")
        .eq("is_public", true)
        .order("is_official", { ascending: false })
        .order("created_at",  { ascending: false })
        .limit(40);
      setCollections((data as Collection[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-24 max-w-6xl mx-auto w-full">

        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ fontFamily: "var(--font-mono)" }}>
              Collections
            </p>
            <h1 className="text-headline text-3xl font-black leading-tight mb-2" style={{ fontFamily: "var(--font-serif)" }}>
              Skill collections
            </h1>
            <p className="text-silver-muted text-sm">Curated sets of skills that work together. Install a whole stack at once.</p>
          </div>
          <Link
            href="/collections/new"
            className="gradient-silver-btn text-xs font-semibold px-4 py-2.5 rounded-[4px] shrink-0 motion-safe:transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Create collection +
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 rounded-[4px] bg-surface animate-pulse" />)}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-silver-muted text-sm mb-2">No collections yet.</p>
            <p className="text-silver-faint text-xs mb-6">Create the first curated skill collection.</p>
            <Link href="/collections/new" className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px]" style={{ fontFamily: "var(--font-mono)" }}>
              Create collection →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(col => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="border border-border-dark rounded-[4px] p-5 flex flex-col gap-3 hover:border-silver-faint motion-safe:transition-colors"
                style={{ background: "var(--color-surface)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-headline text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
                    {col.name}
                  </p>
                  {col.is_official && (
                    <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-amber/15 text-amber border border-amber/30 shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                      ★ Official
                    </span>
                  )}
                </div>
                {col.description && (
                  <p className="text-silver-muted text-xs leading-relaxed line-clamp-2" style={{ fontFamily: "var(--font-sans)" }}>
                    {col.description}
                  </p>
                )}
                <p className="text-silver-faint text-[11px] mt-auto" style={{ fontFamily: "var(--font-mono)" }}>
                  View collection →
                </p>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
