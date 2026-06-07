"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Org = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
};

export default function TeamsPage() {
  const router = useRouter();
  const [user,     setUser]     = useState<User | null>(null);
  const [orgs,     setOrgs]     = useState<Org[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [name,     setName]     = useState("");
  const [slug,     setSlug]     = useState("");
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { router.replace("/auth"); return; }
      setUser(u);
      // Fetch orgs the user belongs to
      supabase
        .from("org_members")
        .select("org_id, organizations(id, name, slug, plan, created_at)")
        .eq("user_id", u.id)
        .then(({ data }) => {
          const orgList = ((data ?? []) as unknown as { organizations: Org }[])
            .map(r => r.organizations)
            .filter(Boolean);
          setOrgs(orgList as Org[]);
          setLoading(false);
        });
    });
  }, [router]);

  async function handleCreate() {
    if (!name.trim() || !slug.trim()) { setError("Name and slug are required."); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { setError("Slug must be lowercase letters, numbers, and hyphens only."); return; }
    setCreating(true);
    setError(null);

    const { data: org, error: err1 } = await supabase
      .from("organizations")
      .insert({ name: name.trim(), slug: slug.trim() })
      .select("id")
      .single();

    if (err1 || !org) {
      setError(err1?.message?.includes("unique") ? "That slug is already taken." : "Failed to create team.");
      setCreating(false);
      return;
    }

    const { error: err2 } = await supabase
      .from("org_members")
      .insert({ org_id: org.id, user_id: user!.id, role: "owner" });

    if (err2) { setError("Team created but could not add you as owner."); setCreating(false); return; }

    setOrgs(prev => [...prev, { id: org.id, name: name.trim(), slug: slug.trim(), plan: "team", created_at: new Date().toISOString() }]);
    setName(""); setSlug(""); setCreating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <SiteNav />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-silver-muted text-sm animate-pulse" style={{ fontFamily: "var(--font-mono)" }}>Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-24 max-w-3xl mx-auto w-full">

        <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ fontFamily: "var(--font-mono)" }}>
          Teams
        </p>
        <h1 className="text-headline text-3xl font-black leading-tight mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          Your teams
        </h1>
        <p className="text-silver-muted text-sm mb-8">
          Share a private skill library with your team. Everyone on the team can access and install the same skills.
        </p>

        {/* Existing orgs */}
        {orgs.length > 0 && (
          <div className="flex flex-col gap-3 mb-10">
            {orgs.map(org => (
              <div key={org.id} className="border border-border-dark rounded-[4px] px-5 py-4 flex items-center gap-4" style={{ background: "var(--color-surface)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-headline text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>{org.name}</p>
                  <p className="text-silver-faint text-[11px] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                    skilldraft.io/teams/{org.slug} · {org.plan} plan
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                  <span className="text-silver-faint text-[10px] px-2 py-0.5 border border-border-dark rounded-[2px]">
                    Coming soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create new team */}
        <div className="border border-border-dark rounded-[4px] p-6">
          <p className="text-headline text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-sans)" }}>
            Create a new team
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-[4px] px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-silver-faint text-[11px] mb-2" style={{ fontFamily: "var(--font-mono)" }}>Team name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Acme Engineering"
                className="w-full bg-surface border border-border-dark rounded-[4px] px-4 py-2.5 text-silver-mid text-sm focus:outline-none focus:border-silver-dim placeholder:text-silver-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
            <div>
              <label className="block text-silver-faint text-[11px] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Slug <span className="opacity-50">(URL-safe identifier)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-silver-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>skilldraft.io/teams/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="acme-eng"
                  className="flex-1 bg-surface border border-border-dark rounded-[4px] px-4 py-2.5 text-silver-mid text-sm focus:outline-none focus:border-silver-dim placeholder:text-silver-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>
            </div>
            <div className="mt-1 p-3 border border-border-dark rounded-[4px] bg-surface">
              <p className="text-silver-faint text-[11px] leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                Team billing and member invitations are coming soon. You can create your team now and invite members when it launches.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !name.trim() || !slug.trim()}
              className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed self-start motion-safe:transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {creating ? "Creating…" : "Create team →"}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
