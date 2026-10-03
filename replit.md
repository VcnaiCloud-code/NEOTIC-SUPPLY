# NEOTIC SUPPLY

A character-led streetwear storefront and brand-universe experience for NEOTIC SUPPLY.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/neotic-supply/` — storefront website and its supplied brand imagery
- `artifacts/api-server/` — shared API service (not currently needed by the storefront)
- `artifacts/mockup-sandbox/` — reusable design preview surface

## Architecture decisions

- The storefront is a frontend-only brand experience; it does not connect to payment, inventory, or order services.
- Keep the provided NEOTIC imagery and bilingual English/Spanish tone as the brand source of truth.

## Product

- Explore the NEOTIC brand and character universe.
- Browse featured apparel, search products, and use a local shopping bag.
- View the Drop 001 campaign countdown.

## User preferences

_No project-specific preferences recorded._

## Gotchas

- The local shopping bag is a storefront interaction only; it does not submit or persist orders.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
