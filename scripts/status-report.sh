#!/bin/bash

echo "----------------------------------"
echo "FEWO BUCHHALTUNG – PROJEKTSTATUS"
echo "----------------------------------"
echo ""
echo "Projektordner:"
pwd
echo ""

echo "Git Branch:"
git branch --show-current
echo ""

echo "Letzter Commit:"
git log -1 --oneline
echo ""

echo "Git Status:"
git status --short
echo ""

echo "Ordner im Projekt:"
ls
echo ""

echo "Ordner in src:"
ls src 2>/dev/null || echo "src nicht gefunden"