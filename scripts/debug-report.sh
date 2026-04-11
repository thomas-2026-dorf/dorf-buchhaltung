#!/bin/bash

echo "----------------------------------"
echo "FEWO BUCHHALTUNG – DEBUG REPORT"
echo "----------------------------------"

echo ""
echo "Node Version:"
node -v

echo ""
echo "NPM Version:"
npm -v

echo ""
echo "Git Branch:"
git branch --show-current

echo ""
echo "Letzter Commit:"
git log -1 --oneline

echo ""
echo "Git Status:"
git status

echo ""
echo "Build Test:"
npm run build