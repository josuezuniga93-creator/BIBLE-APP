#!/bin/bash
cd "/Users/josuezuniga/Documents/Claude/Projects/Rebuttal your church/frontend"
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || true
vercel --prod
echo ""
echo "Done! Live on Vercel."
