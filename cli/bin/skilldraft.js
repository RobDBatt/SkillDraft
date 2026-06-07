#!/usr/bin/env node
/**
 * skilldraft CLI
 * Usage:
 *   npx skilldraft install <skill-id>
 *   npx skilldraft install <username>/<skill-name>   (future)
 *   npx skilldraft search  <query>
 *   npx skilldraft list
 *   npx skilldraft --help
 */

import { existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";

const API_BASE = "https://skilldraft.io/api/skills";
const VERSION  = "0.1.0";

// ── Agent path detection ──────────────────────────────────────────────────────

const AGENT_PATHS = {
  "claude-code": join(homedir(), ".claude", "skills"),
  "codex":       join(homedir(), ".codex",  "skills"),
  "gemini-cli":  join(homedir(), ".gemini", "skills"),
};

// Cursor / Windsurf are project-local — look from cwd upward
function findProjectRoot() {
  let dir = process.cwd();
  while (true) {
    if (existsSync(join(dir, "package.json")) || existsSync(join(dir, ".git"))) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

function detectAgents() {
  const found = [];
  const root  = findProjectRoot();

  for (const [agent, skillsDir] of Object.entries(AGENT_PATHS)) {
    if (existsSync(resolve(skillsDir, ".."))) found.push({ agent, skillsDir, type: "global" });
  }

  if (existsSync(join(root, ".cursor")))   found.push({ agent: "cursor",   skillsDir: join(root, ".cursor",   "rules"), type: "project" });
  if (existsSync(join(root, ".windsurf"))) found.push({ agent: "windsurf", skillsDir: join(root, ".windsurf", "rules"), type: "project" });

  return found;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Commands ──────────────────────────────────────────────────────────────────

async function install(skillId) {
  if (!skillId) { console.error("Usage: npx skilldraft install <skill-id>"); process.exit(1); }

  console.log(`\n⬇  Fetching skill ${skillId}…`);
  const skill = await apiFetch(`/${skillId}`);

  const agents = detectAgents();
  if (agents.length === 0) {
    console.log("\n⚠  No supported agents detected.");
    console.log("   Install Claude Code, Cursor, Windsurf, Codex CLI, or Gemini CLI first.");
    console.log(`\n   You can copy the skill content from: https://skilldraft.io/explore`);
    process.exit(0);
  }

  console.log(`\n✓  Found skill: ${skill.name}`);
  if (skill.quality_score != null) {
    console.log(`   Quality score: ${skill.quality_score}/100`);
  }
  if (skill.author_display_name) {
    console.log(`   Author: ${skill.author_display_name}`);
  }

  for (const { agent, skillsDir } of agents) {
    const skillDir = join(skillsDir, skill.name);
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), skill.content, "utf8");
    console.log(`\n✓  Installed to ${agent}: ${join(skillDir, "SKILL.md")}`);
  }

  console.log(`\n🎯  Restart your agent session to activate the skill.`);
  console.log(`   Browse more skills at: https://skilldraft.io/explore\n`);
}

async function search(query) {
  if (!query) { console.error("Usage: npx skilldraft search <query>"); process.exit(1); }

  console.log(`\n🔍  Searching for "${query}"…\n`);
  const { results } = await apiFetch(`/search?q=${encodeURIComponent(query)}&limit=10`);

  if (results.length === 0) {
    console.log("No skills found. Try a different search term.");
    console.log(`Browse all skills at: https://skilldraft.io/explore\n`);
    return;
  }

  for (const s of results) {
    const score  = s.quality_score != null ? ` [${s.quality_score}/100]` : "";
    const author = s.author_display_name   ? ` by ${s.author_display_name}` : "";
    const badge  = s.is_official ? " ★ Official" : "";
    console.log(`  ${s.id}`);
    console.log(`  ${s.name}${score}${badge}${author}`);
    console.log(`  ${s.copy_count} copies · ${s.save_count} saves\n`);
  }

  console.log(`Install a skill:  npx skilldraft install <skill-id>`);
  console.log(`Browse all:       https://skilldraft.io/explore\n`);
}

function listAgents() {
  const agents = detectAgents();
  console.log("\n📋  Detected agents:\n");
  if (agents.length === 0) {
    console.log("  None found. Install Claude Code, Cursor, Windsurf, Codex CLI, or Gemini CLI.");
    return;
  }
  for (const { agent, skillsDir, type } of agents) {
    const existing = existsSync(skillsDir)
      ? readdirSync(skillsDir).filter(f => existsSync(join(skillsDir, f, "SKILL.md")))
      : [];
    const count = existing.length;
    console.log(`  ${agent} (${type})`);
    console.log(`  path: ${skillsDir}`);
    console.log(`  skills installed: ${count}\n`);
  }
  console.log(`Browse skills:  https://skilldraft.io/explore\n`);
}

function help() {
  console.log(`
  skilldraft v${VERSION}

  USAGE
    npx skilldraft install <skill-id>    Install a skill to all detected agents
    npx skilldraft search  <query>       Search the SkillDraft gallery
    npx skilldraft list                  Show detected agents and installed skills
    npx skilldraft --help                Show this help

  EXAMPLES
    npx skilldraft search "react component"
    npx skilldraft install abc123def456
    npx skilldraft list

  SUPPORTED AGENTS
    Claude Code, Cursor, Windsurf, Codex CLI, Gemini CLI

  MORE
    https://skilldraft.io/explore
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const [,, command, ...rest] = process.argv;

switch (command) {
  case "install": await install(rest[0]); break;
  case "search":  await search(rest.join(" ")); break;
  case "list":    listAgents(); break;
  case "--help":
  case "-h":
  case "help":
  case undefined: help(); break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error("Run: npx skilldraft --help");
    process.exit(1);
}
