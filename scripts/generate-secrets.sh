#!/bin/bash

# Generate strong secrets for .env file
# Usage: bash scripts/generate-secrets.sh

echo "🔐 Generating strong secrets for SSO Backend..."
echo ""

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

echo "Add the following to your .env file:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""
echo "✅ Secrets generated successfully!"
echo "⚠️  Keep these values safe and secret!"
