#!/usr/bin/env bash
set -euo pipefail

# The Nuxt config validates env vars at install time (postinstall -> nuxt prepare),
# so a missing or too-short NUXT_SECRET would make `pnpm i` fail.
if [ ! -f .env ]; then
  cp .env.example .env
  sed -i "s|^NUXT_SECRET=.*|NUXT_SECRET=$(openssl rand -hex 32)|" .env
  echo "Created .env from .env.example. Set NUXT_PASSWORD and NUXT_NOTION_API_KEY before using the app."
fi

pnpm i
