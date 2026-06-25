// Seeds the official, verified flagship skills in seed/skills/*.md into the
// public skills gallery. Idempotent — re-running replaces the official rows.
//
// Usage (needs the service-role key, which only you have):
//   NEXT_PUBLIC_SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node seed/seed-skills.mjs
//
// Optional env:
//   SEED_USER_ID    owner user_id for the rows (defaults to the account that
//                   owns the most existing skills)
//   VERIFY_BASE_URL base URL for the /api/verify scorer (default https://www.skilldraft.io)
//
// Each skill is scored + security-scanned through the live /api/verify endpoint,
// so the stored quality_score is real, and a skill that fails the scan is skipped.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, "skills");

// Filename (without .md) -> category. Add a line here when you add a seed file.
const MANIFEST = {
  "git-commit-writer": { category: "git-version-control" },
  "pr-description-writer": { category: "git-version-control" },
  "postgres-query-guardrails": { category: "database-sql" },
};

const AGENT_TARGETS = ["claude-code", "cursor", "windsurf", "codex", "gemini-cli"];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const verifyBase = process.env.VERIFY_BASE_URL ?? "https://www.skilldraft.io";

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function resolveUserId() {
  if (process.env.SEED_USER_ID) return process.env.SEED_USER_ID;
  const { data, error } = await supabase.from("skills").select("user_id");
  if (error) throw error;
  const counts = {};
  for (const r of data) counts[r.user_id] = (counts[r.user_id] ?? 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) throw new Error("No existing skills to infer an owner; set SEED_USER_ID.");
  return top[0];
}

async function score(content) {
  const res = await fetch(`${verifyBase}/api/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`verify failed: HTTP ${res.status}`);
  return res.json();
}

const userId = await resolveUserId();
const files = readdirSync(SKILLS_DIR).filter((f) => f.endsWith(".md"));

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const cfg = MANIFEST[slug];
  if (!cfg) {
    console.warn(`skip ${file}: no MANIFEST entry`);
    continue;
  }

  const content = readFileSync(join(SKILLS_DIR, file), "utf8");
  const name = (content.match(/^name:\s*(.+)$/m)?.[1] ?? slug).trim();

  const v = await score(content);
  if (!v.passed) {
    console.error(`${name}: FAILED security scan (${v.security?.category}) — skipped`);
    continue;
  }

  // Idempotent: drop any prior official row with this name, then insert fresh.
  await supabase.from("skills").delete().eq("is_official", true).eq("name", name);
  const { error } = await supabase.from("skills").insert({
    user_id: userId,
    name,
    category: cfg.category,
    platform: null,
    content,
    source: "official",
    is_public: true,
    agent_targets: AGENT_TARGETS,
    author_display_name: "SkillDraft",
    quality_score: v.score,
    is_official: true,
  });
  if (error) {
    console.error(`${name}: insert failed — ${error.message}`);
    continue;
  }
  console.log(`seeded ${name} (${cfg.category}) — score ${v.score}, ${v.label}`);
}

console.log("done");
