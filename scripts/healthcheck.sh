#!/bin/bash

# Health check script for SSO backend
# Usage: bash scripts/healthcheck.sh

PORT="${PORT:-3000}"
HOST="${HOST:-localhost}"

echo "🔍 Checking SSO backend health..."
echo "Target: http://${HOST}:${PORT}"

# Check if server responds
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${HOST}:${PORT}/api/auth/login 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "000" ]; then
    echo "❌ Server is not responding"
    echo "   Make sure the server is running: npm run dev"
    exit 1
elif [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "405" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "422" ]; then
    echo "✅ Server is UP (HTTP $HTTP_CODE - endpoint accessible)"
    exit 0
else
    echo "✅ Server responded with HTTP $HTTP_CODE"
    exit 0
fi
