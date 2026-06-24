import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only admin client — uses the service role key, bypasses RLS.
// Never import this in client components.
//
// Lazily instantiated via a Proxy: the underlying client is built on first
// property access, not at module load. This keeps `next build` (page-data
// collection) from crashing when SUPABASE_SERVICE_ROLE_KEY is absent — e.g.
// local builds without production secrets. Only code paths that actually touch
// the DB will throw, and only if the key is genuinely missing at runtime.

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "supabaseAdmin: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    );
  }

  client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = getClient();
    const value = Reflect.get(c, prop, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});

/**
 * Run a read-only Supabase query and return its rows — or null if the query (or
 * the underlying client construction) throws. Lets server components that only
 * *display* public data degrade to an empty state instead of crashing
 * prerender/render when the data source is unreachable: a build without the
 * service-role key, or a transient Supabase outage.
 *
 * Pass a thunk, not a built query: `supabaseAdmin.from(...)` can throw during
 * construction (the lazy client has no key), so the query must be built inside
 * the try to be caught.
 */
export async function safeSelect<T>(
  run: () => PromiseLike<{ data: T | null }>
): Promise<T | null> {
  try {
    const { data } = await run();
    return data;
  } catch (err) {
    console.error("safeSelect: query failed, falling back to empty", err);
    return null;
  }
}
