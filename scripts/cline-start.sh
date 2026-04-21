#!/bin/bash

echo ""
echo "==============================="
echo "Cline Start – Kontext + Prompt"
echo "==============================="
echo ""

echo "----- CHAT CONTEXT -----"
if [ -f docs/CHAT_CONTEXT.txt ]; then
  cat docs/CHAT_CONTEXT.txt
else
  echo "Kein CHAT_CONTEXT.txt gefunden"
fi

echo ""
echo "----- FACHKONZEPT -----"
if [ -f docs/DORF_BUCHHALTUNG_KONZEPT.txt ]; then
  cat docs/DORF_BUCHHALTUNG_KONZEPT.txt
else
  echo "Kein DORF_BUCHHALTUNG_KONZEPT.txt gefunden"
fi

echo ""
echo "----- START PROMPT -----"
if [ -f cline-start-prompt.txt ]; then
  cat cline-start-prompt.txt
else
  echo "Kein cline-start-prompt.txt gefunden"
fi

echo ""
echo "==============================="
echo "➡️ Alles oben kopieren und in Cline einfügen"
echo "==============================="
