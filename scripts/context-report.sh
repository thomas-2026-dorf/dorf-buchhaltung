#!/bin/bash

OUT="docs/CHAT_CONTEXT.txt"

{
  echo "----------------------------------"
  echo "FEWO BUCHHALTUNG – CHAT CONTEXT"
  echo "----------------------------------"
  echo ""

  echo "===== STATUS ====="
  bash scripts/status-report.sh
  echo ""

  echo "===== PROJECT MAP ====="
  bash scripts/generate-project-map.sh
  cat docs/PROJECT_MAP.md 2>/dev/null
  echo ""

  echo "===== DEBUG ====="
  bash scripts/debug-report.sh
  echo ""

  echo "----------------------------------"
  echo "ENDE"
} > "$OUT" 2>&1

echo "Chat Context erstellt: $OUT"