"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";

export default function NewCollectionPage() {
  const router = useRouter();
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [isPublic,    setIsPublic]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) { setError("Collection name is required."); return; }
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data, error: err } = await supabase
      .from("collections")
      .insert({ user_id: user.id, name: name.trim(), description: description.trim() || null, is_public: isPublic })
      .select("id")
      .single();

    if (err || !data) {
      setError("Failed to create collection. Please try again.");
      setSaving(false);
      return;
    }

    router.push(`/collections/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 flex flex-col items-center justify-start pt-16 pb-24 px-6">
        <div className="w-full max-w-lg">
          <p className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ fontFamily: "var(--font-mono)" }}>
            New collection
          </p>
          <h1 className="text-headline text-2xl font-black mb-6" style={{ fontFamily: "var(--font-serif)" }}>
            Create a skill collection
          </h1>

          {error && (
            <div className="mb-5 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-[4px] px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-silver-faint text-[11px] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Collection name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Full-Stack TypeScript Kit"
                className="w-full bg-surface border border-border-dark rounded-[4px] px-4 py-2.5 text-silver-mid text-sm focus:outline-none focus:border-silver-dim placeholder:text-silver-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>

            <div>
              <label className="block text-silver-faint text-[11px] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Description <span className="opacity-50">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What does this collection cover and who is it for?"
                rows={3}
                className="w-full bg-surface border border-border-dark rounded-[4px] px-4 py-2.5 text-silver-mid text-sm resize-none focus:outline-none focus:border-silver-dim placeholder:text-silver-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded accent-amber"
              />
              <span className="text-silver-muted text-sm" style={{ fontFamily: "var(--font-sans)" }}>
                Share publicly on Explore
              </span>
            </label>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving || !name.trim()}
                className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed motion-safe:transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {saving ? "Creating…" : "Create collection →"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
