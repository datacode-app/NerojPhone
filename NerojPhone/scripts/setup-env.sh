#!/bin/bash

# setup-env.sh
# --------------------
# This script automatically configures the environment variables for the monorepo.
# It copies the root .env.example to .env and syncs it across apps/web and apps/api.

# Get the project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "___________________________________________________"
echo "🚀 NerojPhone: Setting up Environment Variables..."
echo "___________________________________________________"

# 1. Setup Root .env
if [ -f "$ROOT_DIR/.env" ]; then
  echo "✅ Root .env already exists. Skipping creation."
else
  if [ -f "$ROOT_DIR/.env.example" ]; then
    echo "⚠️  Root .env not found. Copying from .env.example..."
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    echo "✅ Created root .env"
  else
    echo "❌ Error: .env.example not found!"
    exit 1
  fi
fi

# 2. Sync to Frontend (apps/web)
# Next.js prefers .env.local for local secrets
echo "👉 Configuring Frontend (apps/web)..."
cp "$ROOT_DIR/.env" "$ROOT_DIR/apps/web/.env.local"
echo "✅ apps/web/.env.local updated."

# 3. Sync to Backend (apps/api)
# NestJS typically uses .env
echo "👉 Configuring Backend (apps/api)..."
cp "$ROOT_DIR/.env" "$ROOT_DIR/apps/api/.env"
echo "✅ apps/api/.env updated."

echo "___________________________________________________"
echo "🎉 Setup Complete!"
echo "❗  ACTION REQUIRED: Open '.env' in the root directory and fill in your Supabase keys."
echo "___________________________________________________"
