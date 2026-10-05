# EasyPlanner

This project is a private application intended for private use only.

EasyPlanner is a Vue 3 recipe planning app designed to help manage weekly meals, recipes, shopping lists, and household planning. It uses Supabase for authentication and data storage, and it is focused on a personal or private workflow rather than public distribution.

## Overview

The app includes:

- User authentication with Supabase
- Group setup for a household or private planning context
- Weekly meal planner
- Recipe management and list browsing
- Shopping list generation
- User profile management

## Tech Stack

- Vue 3
- Vite
- TypeScript
- Vue Router
- Pinia
- Supabase
- Tailwind CSS

## Project Structure

- `src/views/` – app screens such as login, planner, profile, recipes, and shopping list
- `src/stores/` – Pinia stores for app state
- `src/router/` – route configuration and auth guards
- `src/services/` – external service integrations
- `src/lib/` – reusable library utilities
- `src/components/` – reusable UI components

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

Using pnpm (recommended):

```bash
pnpm install
```

Or with npm:

```bash
npm install
```

## Run locally

```bash
pnpm dev
```

or

```bash
npm run dev
```

## Production build

```bash
pnpm build
```

or

```bash
npm run build
```

## Notes

- This repository is intended for private personal use.
- It is not meant to be published as a public app or shared as a general-purpose product.
- Configuration and data access may be tailored to a specific user/group setup.

## License

This project is private and intended for personal use only.
