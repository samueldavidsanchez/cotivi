# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version

This project uses **Next.js 16**, which has breaking changes from prior versions. APIs, conventions, and file structure may differ from training data. Check `node_modules/next/dist/docs/` before writing Next.js-specific code.

## Commands

```bash
npm run dev        # Dev server on localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npx tsc --noEmit   # Type check only
npm run db:push    # Push Drizzle schema to Neon (first-time setup)
npm run db:studio  # Drizzle Studio (visual DB browser)
```

## Architecture

**CotiVi** is a quotation tool for Vivancar. Next.js 16 App Router + TypeScript + Tailwind + Neon (Postgres) + Drizzle ORM.

### Database setup (one-time)

1. Create project on [neon.tech](https://neon.tech) and get the `DATABASE_URL`
2. Add it to `.env.local`
3. Run `npm run db:push` to create tables via Drizzle
4. Run `db/setup.sql` in the Neon SQL Editor (adds quote numbering trigger and sequence — not managed by Drizzle)

### Key flows

1. **Catalog load** — `/catalogo`: upload Excel → `parseProductosExcel()` (client) → `POST /api/catalogo/importar` → upserts into `products` table (conflict on `codigo`).

2. **Quote builder** — `/cotizador`: all state lives in Zustand (`src/store/cotizacion.ts`, persisted to `localStorage` under key `cotizacion-draft`). On save → `POST /api/cotizaciones` → writes `quotes` + `quote_items` → redirects to detail page.

3. **Quote detail + PDF** — `/cotizaciones/[id]`: server component queries Neon directly (Drizzle), renders `PreviewCotizacion` (HTML) and `DescargaPDF` (client button). PDF uses `@react-pdf/renderer` with dynamic import to avoid SSR issues (`serverExternalPackages` set in `next.config.ts`). PDF component: `DocumentoPDF.tsx`.

4. **Indicators** — `/api/indicadores` proxies SBIF API (UF + USD, 1h ISR cache). `SBIF_API_KEY` must stay server-side only. `IndicadoresBar` fetches from this route on mount.

### Database (Neon + Drizzle)

Schema in `src/lib/schema.ts`. Three tables:
- `products` — catalog with `codigo` as unique conflict target for upserts
- `quotes` — headers; `numero` (COT-001) and `correlativo` are set by the DB trigger in `db/setup.sql`, never set manually
- `quote_items` — line items, cascade-deleted with their quote

**Important:** Drizzle returns `numeric` columns as strings. All server components and API routes must call `Number()` before returning data to the client.

### DB access pattern

- **Server components** → import `db` from `@/lib/db` directly
- **Client components** → fetch API routes only (Neon driver is server-only)
- API routes: `/api/productos` (GET), `/api/cotizaciones` (POST), `/api/catalogo/importar` (POST)

### Business logic

All financial calculations in `src/lib/cotizacion.ts`:
- `calcularSubtotalItem` — per-item discount (% or fixed amount)
- `calcularTotales` — global discount (% or fixed) + IVA 19%
- `calcularRentabilidad` — profit/margin analysis (internal only, never exposed in PDF)
- `formatCLP` / `formatUF` — Chilean number formatting

### Env vars

```
DATABASE_URL=postgresql://...@...neon.tech/...?sslmode=require
SBIF_API_KEY=...
```

### Brand

Vivancar: green `#8B9E45`, dark `#282828`. Logos in `public/logo.png` (dark bg) and `public/logo-blanco.png` (white bg, used in navbar).
