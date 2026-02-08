#!/bin/bash
# Serve PM App on port 3003

echo "🚀 Starting PM App server..."

if [ -d "/root/.openclaw/workspace/pm-app/dist" ]; then
    cd /root/.openclaw/workspace/pm-app/dist
    nohup python3 -m http.server 3003 > server.log 2>&1 &
    echo "✅ PM App served from dist/ on port 3003"
elif [ -d "/root/.openclaw/workspace/pm-app/.next" ]; then
    cd /root/.openclaw/workspace/pm-app
    nohup npx next start -p 3003 > server.log 2>&1 &
    echo "✅ PM App served from .next/ on port 3003"
else
    echo "⏳ PM App not built yet. Run 'npm run build' first."
fi
