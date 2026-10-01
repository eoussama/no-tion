#!/usr/bin/env bash
set -euo pipefail

# Env vars are validated when the server starts (server/plugins/env.ts), not at install time,
# so `pnpm i` works without a .env. Bootstrap one so `pnpm dev` works once the values are filled in.
if [ ! -f .env ]; then
  cp .env.example .env
  sed -i "s|^NUXT_SECRET=.*|NUXT_SECRET=$(openssl rand -hex 32)|" .env
  echo "Created .env from .env.example. Set NUXT_PASSWORD and NUXT_NOTION_API_KEY before using the app."
fi

pnpm i
