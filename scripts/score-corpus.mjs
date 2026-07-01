#!/usr/bin/env node
// Scores the calibration corpus (fixtures/verify-corpus) through lib/scoreSkill.ts.
// Run after ANY change to scoreSkill and update the README table there.
//
//   node scripts/score-corpus.mjs [extra-dir ...]
//
// Extra dirs of .md files (e.g. exported production skills) are scored too.
// Degenerate controls (empty / binary garbage / non-skill markdown) are
// generated in-memory — they must stay at the bottom of the table.

import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const TMP = ".tmp-score-corpus";
execSync(`npx tsc lib/scoreSkill.ts --outDir ${TMP} --module commonjs --target es2020 --skipLibCheck`, { stdio: "inherit" });
const require = createRequire(import.meta.url);
const { scoreSkill, scoreLabel } = require(join(process.cwd(), TMP, "scoreSkill.js"));

const inputs = [];
const addDir = (dir, prefix = "") => {
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith(".md") || f === "README.md") continue;
    inputs.push({ name: prefix + f.replace(/\.md$/, ""), content: readFileSync(join(dir, f), "utf8") });
  }
};
addDir("fixtures/verify-corpus");
for (const extra of process.argv.slice(2)) if (existsSync(extra)) addDir(extra, "[extra] ");

inputs.push(
  { name: "control-empty", content: "" },
  { name: "control-garbage", content: "hello \u0000\u0001 binary-ish \uFFFD\n" },
  { name: "control-non-skill", content: "# My Project\n\nA readme.\n\n```bash\nnpm install\nnpm test\n```\n\n```js\nconsole.log(1)\n```\n## Usage\nDo not use in production. Never commit secrets. Avoid global installs.\n" },
);

const rows = inputs.map(({ name, content }) => {
  const r = scoreSkill(content);
  return { name, ...r, band: scoreLabel(r.score) };
}).sort((a, b) => b.score - a.score);

console.log("\n" + "file".padEnd(42), "score band      desc wNot why tmpl stop anti chk");
for (const r of rows) {
  console.log(r.name.padEnd(42), String(r.score).padStart(5), r.band.padEnd(9),
    ...[r.descriptionScore, r.whenNotScore, r.whyScore, r.templateScore, r.hardStopsScore, r.antiPatternsScore, r.checklistScore]
      .map((n) => String(n).padStart(4)));
}
rmSync(TMP, { recursive: true, force: true });
