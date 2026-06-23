#!/bin/bash
cd "/Users/josuezuniga/Documents/Claude/Projects/Rebuttal your church/frontend"
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')"
git push
echo ""
echo "Done! Vercel is deploying..."
