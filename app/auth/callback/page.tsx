"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase client detects the access_token from the URL hash automatically.
    // We just wait for it to fire SIGNED_IN.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        const params = new URLSearchParams(window.location.search);
        router.replace(params.get("next") ?? "/skills");
      }
    });

    // Also try exchanging a code if present (PKCE flow fallback)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        if (err) setError(err.message);
        // onAuthStateChange will handle the redirect on success
      });
    }

    const timeout = setTimeout(() => {
      setError("Sign-in link may have expired. Please try again.");
    }, 10_000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-5">{error}</p>
          <a
            href="/auth"
            className="text-silver-mid text-sm hover:text-silver-hi motion-safe:transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← Try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <p
        className="text-silver-muted text-sm animate-pulse"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Signing you in…
      </p>
    </div>
  );
}
