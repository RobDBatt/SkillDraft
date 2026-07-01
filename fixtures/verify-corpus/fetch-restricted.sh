#!/bin/bash
# Downloads the anthropics/skills document skills (docx/pdf/pptx/xlsx) for
# local calibration runs. These are source-available but NOT open source, so
# they are fetched on demand rather than committed. Downloads are gitignored.
set -euo pipefail
cd "$(dirname "$0")"

for s in docx pdf pptx xlsx; do
  curl -fsS -o "anthropic-$s.md" \
    "https://raw.githubusercontent.com/anthropics/skills/main/skills/$s/SKILL.md"
  echo "fetched anthropic-$s.md ($(wc -c < "anthropic-$s.md") bytes)"
done
