import { supabaseAdmin } from "@/lib/supabase-admin";
import { VERIFY_BANDS, VERIFY_FLAGS, VERIFY_LENGTH_BANDS } from "@/lib/verifyMeta";

// Server-only: writes the append-only /verify event log. Never import from a
// client component (pulls in the service-role admin client).

export interface VerifyEventInput {
  source: "web" | "api";
  score: number;
  passed: boolean;
  band: string;
  flaggedFor?: string | null;
  hasFrontmatter: boolean;
  lengthBand: string;
}

const BANDS = new Set<string>(VERIFY_BANDS);
const FLAGS = new Set<string>(VERIFY_FLAGS);
const LENGTHS = new Set<string>(VERIFY_LENGTH_BANDS);

/**
 * Append-only log of /verify run metadata. Validates/clamps every field,
 * inserts via the service-role admin client, and NEVER throws — logging must
 * not break the user flow. Stores no skill content or names.
 */
export async function recordVerifyEvent(input: VerifyEventInput): Promise<void> {
  try {
    const score = Math.max(0, Math.min(100, Math.round(Number(input.score) || 0)));
    await supabaseAdmin.from("verify_events").insert({
      source: input.source === "api" ? "api" : "web",
      score,
      passed: Boolean(input.passed),
      band: BANDS.has(input.band) ? input.band : "Basic",
      flagged_for:
        input.flaggedFor && FLAGS.has(input.flaggedFor) ? input.flaggedFor : null,
      has_frontmatter: Boolean(input.hasFrontmatter),
      length_band: LENGTHS.has(input.lengthBand) ? input.lengthBand : "unknown",
    });
  } catch (err) {
    console.error("recordVerifyEvent failed", err);
  }
}
