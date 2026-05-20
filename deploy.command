#!/bin/bash
cd "$(dirname "$0")/frontend"
echo "🚀 Deploying Tulip Bible App to Vercel..."
vercel --prod
echo "✅ Done!"
