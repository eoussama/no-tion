<p align="center">
  <img width="120" src="https://github.com/eoussama/no-tion/blob/main/public/logo.png?raw=true">
</p>

<p align="center">
A personal, local-first manager for Notion databases. It reads your databases, caches them on your device,
and gives each one a form that looks and feels like Notion.
</p>

<p align="center">
    <a href="https://github.com/eoussama/no-tion/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/eoussama/no-tion" /></a>
    <img src="https://img.shields.io/github/v/release/eoussama/no-tion" />
    <img src="https://img.shields.io/github/languages/code-size/eoussama/no-tion" />
</p>

## What it does

- Lists every Notion database shared with your integration.
- Shows each one as a gallery or a table, and each row as a Notion-style page you can edit.
- Adds rows through a form. Databases with a hand-written definition get a tailored form (Cinema & TV can prefill itself from an IMDb search). Any other database gets a form generated from its Notion properties, with no setup.
- Keeps a copy of your data in the browser (IndexedDB), so pages open instantly and stay readable offline. Changes appear immediately and sync to Notion in the background.
- Light and dark mode.
- One user, one password.

## Stack

| Concern | Choice |
|---|---|
| Framework | Nuxt 4, client-rendered (`ssr: false`), Nitro server for the Notion API and auth |
| UI | Nuxt UI 4 + Tailwind CSS 4, themed after Notion |
| Data | TanStack Query, persisted to IndexedDB with `idb-keyval` |
| Forms | TanStack Form + zod |
| Notion | `@notionhq/client` v5 (data sources API) |
| Tests | Vitest |

## Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- pnpm 10, pinned through the `packageManager` field (run `corepack enable`)
- A Notion integration token

## Setup

```sh
pnpm install
cp .env.example .env
```

Then fill in `.env`. The server validates these values when it starts and refuses to run if one is wrong.

| Variable | Required | Description |
|---|---|---|
| `NUXT_SECRET` | yes | Signs session cookies. At least 32 characters, e.g. `openssl rand -hex 32`. |
| `NUXT_PASSWORD` | yes | The login password. Use a long one. |
| `NUXT_NOTION_API_KEY` | yes | Your integration token. |
| `NUXT_TMDB_API_KEY` | no | A TMDB v3 API key or v4 read token. Powers the movie/TV lookup on the Cinema & TV form; without it, that lookup is disabled and only manual entry works. |

To get a Notion token:

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and create an internal integration.
2. Copy its token into `NUXT_NOTION_API_KEY`.
3. In Notion, share each database you want to manage with the integration.

The session cookie is marked `Secure` in production builds, so serve the app over HTTPS (or on `localhost`).

## Development

```sh
pnpm dev        # http://localhost:3000
pnpm lint       # ESLint, also handles formatting
pnpm nuxt typecheck
pnpm test       # Vitest
pnpm build      # production build in .output/
pnpm preview    # serve the production build
```

## Project layout

```
core/                 Code shared by client and server
  notion/             Reading and writing Notion property values, schema normalization
  databases/          The database registry and its definitions
    cinema-tv/        Hand-written definition for Cinema & TV (fields, zod schemas, IMDb lookup)
    generic/          Definition generated from any database's live schema
server/
  api/db/             List databases, read the schema, list/create/update/archive rows
  api/lookup/         Title search providers (TMDB)
  utils/              Notion client, auth, validation
app/
  queries/            TanStack Query hooks, with optimistic mutations
  components/database Table, gallery, form, slide-over, property fields, Notion tags
  databases/          Optional custom form components, by database slug
```

## Adding a database

Any database shared with the integration already works. It appears on the home page with a form generated from its properties.

Write a definition when a database needs more than that: custom labels, hidden or conditional fields, defaults, validation, or a lookup that prefills the form.

1. Create `core/databases/<slug>/` with a zod row and input schema and a `TDatabaseDefinition` (see `core/databases/cinema-tv/definition.ts`). Set `id` to the Notion database id and list the fields you want, each mapped to a Notion property.
2. Register it in `core/databases/registry.ts` with `registerDatabase(...)`.
3. Optional: add a `lookup` to prefill the form from an external search. Providers live in `server/utils/lookup/`.
4. Optional: for a form that the generic one can't express, add a component to `DATABASE_FORMS` in `app/databases/index.ts`.

Select, multi-select and status options always come from the live Notion schema, so the form never drifts from Notion.

## Security notes

- The Notion token and password never leave the server.
- Sessions are stateless HMAC-signed cookies that expire after 2 hours.
- Failed logins are throttled per client address (5 attempts per 5 minutes). Behind a reverse proxy, every client shares one address, so the limit applies to all of them together.
