/**
 * Admin allowlist for internal pages (e.g. /stats).
 *
 * Reads ADMIN_EMAILS (comma-separated, case-insensitive). Fails CLOSED: if the
 * env var is unset or empty, nobody is an admin — the page stays locked until
 * an allowlist is configured.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}
