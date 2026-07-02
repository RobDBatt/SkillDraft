#!/usr/bin/env node
// Project invariant checks — run via `npm test` (locally and in CI).
//
// These encode rules that were violated or nearly violated in past work and
// were previously enforced only by review. Checks for features that haven't
// merged yet (guardrails, generation cache) activate automatically once the
// relevant code is present. Pure Node, no dependencies.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

let failures = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const skip = (msg) => console.log(`  - ${msg} (skipped — feature not present)`);
const fail = (msg) => {
  failures++;
  console.error(`  ✗ ${msg}`);
};

const read = (p) => readFileSync(p, "utf8");

// ── 1. No binary/NUL-corrupted source files ──────────────────────────────────
// A generated .ts file once shipped with NUL bytes between template-literal
// separators, turning it into a binary blob that failed the build.
{
  console.log("\nSource files are clean text:");
  const roots = ["app", "components", "lib", "scripts", "supabase"];
  const exts = new Set([".ts", ".tsx", ".mjs", ".js", ".css", ".sql", ".sh", ".json", ".md"]);
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".next") walk(p);
      } else if (exts.has(extname(entry.name))) {
        if (readFileSync(p).includes(0)) offenders.push(p);
      }
    }
  };
  for (const r of roots) if (existsSync(r)) walk(r);
  if (offenders.length === 0) ok("no NUL bytes in any source file");
  else fail(`NUL bytes (binary corruption) in: ${offenders.join(", ")}`);
}

// ── 2. PACKS stay in sync across their two definitions ──────────────────────
// lib/stripe.ts is canonical (cents, lookup keys); app/pricing/page.tsx is the
// display copy (dollars). They must list the same packs with matching values.
{
  console.log("\nPricing PACKS definitions agree:");
  const stripeSrc = read("lib/stripe.ts");
  const pageSrc = read("app/pricing/page.tsx");

  const stripeBlock = stripeSrc.slice(
    stripeSrc.indexOf("export const PACKS"),
    stripeSrc.indexOf("} as const")
  );
  const stripePacks = new Map();
  for (const m of stripeBlock.matchAll(/(\w+):\s*\{\s*credits:\s*(\d+),\s*amount:\s*(\d+)/g)) {
    stripePacks.set(m[1], { credits: +m[2], amountCents: +m[3] });
  }

  const pageBlock = pageSrc.slice(pageSrc.indexOf("const PACKS"), pageSrc.indexOf("] as const"));
  const pagePacks = new Map();
  for (const m of pageBlock.matchAll(/key:\s*"(\w+)",\s*credits:\s*(\d+),\s*price:\s*(\d+)/g)) {
    pagePacks.set(m[1], { credits: +m[2], priceDollars: +m[3] });
  }

  if (stripePacks.size === 0 || pagePacks.size === 0) {
    fail("could not parse PACKS from lib/stripe.ts or app/pricing/page.tsx — update the regexes in scripts/check-invariants.mjs");
  } else {
    const stripeKeys = [...stripePacks.keys()].sort().join(",");
    const pageKeys = [...pagePacks.keys()].sort().join(",");
    if (stripeKeys !== pageKeys) {
      fail(`pack keys differ — lib/stripe.ts has [${stripeKeys}], page has [${pageKeys}]`);
    } else {
      ok(`same pack keys: [${pageKeys}]`);
      for (const [key, s] of stripePacks) {
        const p = pagePacks.get(key);
        if (p.credits !== s.credits)
          fail(`${key}: credits differ (stripe ${s.credits} vs page ${p.credits})`);
        else if (p.priceDollars * 100 !== s.amountCents)
          fail(`${key}: price mismatch (page $${p.priceDollars} vs stripe ${s.amountCents}¢)`);
        else ok(`${key}: ${s.credits} credits @ $${p.priceDollars} matches ${s.amountCents}¢`);
      }
    }
  }
}

// ── 3. Spend-guardrail ordering in the paid routes ───────────────────────────
// The daily cap must run AFTER the per-user gate (rate limit / credit deduct),
// otherwise one anonymous IP can loop requests and exhaust the global cap
// (cheap DoS). A cap block for a logged-in user must refund the credit.
{
  console.log("\nGuardrail ordering (gate → cap → model):");
  for (const route of ["app/api/generate/route.ts", "app/api/improve/route.ts"]) {
    const src = read(route);
    if (!src.includes("checkDailyCap")) {
      skip(`${route}: no daily cap`);
      continue;
    }
    const capCall = src.indexOf("await checkDailyCap()");
    const deduct = src.indexOf('rpc("deduct_credit"');
    const rateLimit = src.indexOf("await checkRateLimit(");
    const refund = src.indexOf('rpc("add_credits"');

    if (capCall === -1) fail(`${route}: checkDailyCap imported but never awaited`);
    else if (deduct === -1 || deduct > capCall)
      fail(`${route}: credit deduction must run BEFORE the daily cap check`);
    else if (rateLimit === -1 || rateLimit > capCall)
      fail(`${route}: anon rate limit must run BEFORE the daily cap check`);
    else if (refund === -1 || refund < capCall)
      fail(`${route}: cap block must refund the deducted credit (add_credits after cap check)`);
    else ok(`${route}: gate → cap → refund ordering holds`);
  }
}

// ── 4. Generation-cache safety rules ─────────────────────────────────────────
// Only clean, complete results may be cached (a truncated/refused output would
// be served forever), and Regenerate must bypass the cache lookup.
{
  console.log("\nGeneration cache rules:");
  if (!existsSync("lib/generationCache.ts")) {
    skip("lib/generationCache.ts");
  } else {
    const cacheSrc = read("lib/generationCache.ts");
    const routeSrc = read("app/api/generate/route.ts");
    const pageSrc = read("app/generate/page.tsx");

    if (!cacheSrc.includes("PROMPT_VERSION"))
      fail("generationCache: PROMPT_VERSION missing — cache can't be invalidated on prompt-format changes");
    else ok("PROMPT_VERSION present in cache key material");

    if (!/["']end_turn["']/.test(routeSrc))
      fail("generate route: results are cached without checking stop_reason === \"end_turn\" (truncated output would be cached)");
    else ok("only end_turn results are cached");

    if (!/fresh/.test(pageSrc))
      fail("generate page: Regenerate no longer passes a fresh flag — users would get the cached copy back");
    else ok("Regenerate bypasses the cache (fresh flag)");
  }
}

console.log(failures === 0 ? "\nAll invariant checks passed." : `\n${failures} invariant check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
