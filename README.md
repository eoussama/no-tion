# no-tion

A personal Notion account manager that provides forms to automate data insertion into Notion databases using the Notion API.

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- pnpm (recommended) or npm

## Project Setup

Install dependencies:

```sh
pnpm install
```

## Development

Start the development server with hot-reload:

```sh
pnpm dev
```

The application will be available at `http://localhost:5173`

## Production Build

Type-check, compile and minify for production:

```sh
pnpm build
```

Preview the production build locally:

```sh
pnpm preview
```

## Testing

Run unit tests with Vitest:

```sh
pnpm test:unit
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

## Notion API Integration

This project uses the Notion API to interact with your Notion workspace. You'll need:

1. A Notion account
2. A Notion integration (API key)
3. Database IDs you want to interact with

Refer to the [Notion API documentation](https://developers.notion.com/) for setup instructions.
