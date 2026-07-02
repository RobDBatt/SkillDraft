#!/bin/bash
set -euo pipefail

# Install dependencies for Claude Code on the web so sessions can run
# typecheck/lint/tests locally instead of using Vercel as the compiler.
# Local (non-remote) sessions are left alone.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# npm install (not ci): idempotent, and the container cache keeps repeat
# sessions fast once node_modules is populated.
npm install --no-audit --no-fund
