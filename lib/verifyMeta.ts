/**
 * Pure, isomorphic helpers for /verify event metadata.
 *
 * No server imports — safe to use from both the client page and server routes.
 * Keep this free of `supabase-admin` so the client bundle never pulls it in.
 */

export const VERIFY_BANDS = ["Excellent", "Good", "Fair", "Basic"] as const;
export const VERIFY_FLAGS = [
  "injection",
  "dangerous_command",
  "exfiltration",
  "obfuscation",
] as const;
export const VERIFY_LENGTH_BANDS = ["<500", "500-2k", "2k-10k", "10k+", "unknown"] as const;

/** Bucket content length so exact sizes are never stored or sent. */
export function lengthBand(n: number): string {
  if (n < 500) return "<500";
  if (n < 2_000) return "500-2k";
  if (n < 10_000) return "2k-10k";
  return "10k+";
}
