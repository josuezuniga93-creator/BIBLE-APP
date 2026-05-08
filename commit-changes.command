#!/bin/bash
# Double-click this in Finder to commit all current changes to git.

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║    Committing changes to git…            ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Remove stale lock if present
rm -f .git/index.lock 2>/dev/null

git add -A

if git diff --cached --quiet; then
  echo "✓ Nothing to commit — everything is already saved."
else
  git commit -m "chore: save latest changes"
  echo ""
  echo "✓ Changes committed successfully!"
fi

echo ""
echo "Press any key to close…"
read -n 1
