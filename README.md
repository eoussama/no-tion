<p align="center">
  <img width="120" src="https://github.com/eoussama/no-tion/blob/main/public/logo.png?raw=true">
</p>

<p align="center">
A personal Notion account manager that provides forms to ease data insertion into Notion databases using the Notion SDK.
Built with Nuxt 3 with server-side API integration for secure Notion API key handling.
</p>

<p align="center">
    <a href="https://github.com/eoussama/no-tion/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/eoussama/no-tion" /></a>
    <img src="https://img.shields.io/github/v/release/eoussama/no-tion" />
    <img src="https://img.shields.io/github/languages/code-size/eoussama/no-tion" />
</p>

## Prerequisites

- Node.js `23.6.0` or newer
- pnpm (recommended) or npm
- Notion Integration Token

## Project Setup

Install dependencies:

```sh
pnpm install
```

Create a `.env` file in the root directory with your Notion API key and password:

```sh
NUXT_PASSWORD=your_secure_password_here
NUXT_NOTION_API_KEY=your_notion_integration_token_here
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

### Production Build

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

### Code Quality

Lint and fix code:

```sh
pnpm lint
```

Format code:

```sh
pnpm format
```
