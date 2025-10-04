<p align="center">
  <img width="120" src="https://github.com/eoussama/no-tion/blob/main/public/logo.png?raw=true">
</p>

<p align="center">
A personal Notion account manager that provides forms to automate data insertion into Notion databases using the Notion API.
Built with Nuxt 3 with server-side API integration for secure Notion API key handling.
</p>

<p align="center">
    <a href="https://github.com/eoussama/no-tion/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/eoussama/no-tion" /></a>
    <a href="https://github.com/eoussama/no-tion/actions/workflows/publish.yml" target="_blank"><img src="https://github.com/eoussama/core/actions/workflows/publish.yml/badge.svg" /></a>
    <img src="https://img.shields.io/github/v/release/eoussama/no-tion" />
    <img src="https://img.shields.io/github/languages/code-size/eoussama/core" />
</p>

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- pnpm (recommended) or npm
- Notion Integration Token

## Project Setup

Install dependencies:

```sh
pnpm install
```

Create a `.env` file in the root directory with your Notion API key and password:

```sh
NUXT_NOTION_API_KEY=your_notion_integration_token_here
NUXT_PASSWORD=your_secure_password_here
```

To get your Notion API key:

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the "Internal Integration Token"
4. Share your databases with the integration in Notion

## Development

Start the development server with hot-reload:

```sh
pnpm dev
```

The application will be available at `http://localhost:3000`

## Production Build

Type-check, compile and minify for production:

```sh
pnpm build
```

Preview the production build locally:

```sh
pnpm preview
```

Generate static site:

```sh
pnpm generate
```

## Code Quality

Lint and fix code:

```sh
pnpm lint
```

Format code:

```sh
pnpm format
```

## Architecture

- **Nuxt 3** - Full-stack Vue framework with server-side rendering
- **Server API Routes** - Notion API calls handled securely on the server
- **TypeScript** - Type-safe development
- **Notion SDK** - Official Notion JavaScript SDK

All Notion API calls are made server-side to keep your API key secure and never expose it to the client.

## Notion API Integration

This project uses the Notion API to interact with your Notion workspace. You'll need:

1. A Notion account
2. A Notion integration (API key)
3. Database IDs you want to interact with

Refer to the [Notion API documentation](https://developers.notion.com/) for setup instructions.
