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
npm run db:seed    # Seed data via tsx (db/seed.ts) — e.g. creating the first user
```

There is no test suite. "Linting" is ESLint and type checking is `tsc --noEmit`.

## Architecture

**CotiVi** is a quotation tool for Vivancar. Next.js 16 App Router + TypeScript + Tailwind + Neon (Postgres) + Drizzle ORM + NextAuth v5.

### Auth

NextAuth v5 (Credentials provider, JWT sessions) gates the whole app. Three-file split:
- `src/auth.config.ts` — edge-safe config: `pages.signIn = /login` and the `authorized` callback (redirect rules). No DB imports here.
- `src/auth.ts` — full config: the Credentials provider that looks up `users` by email and verifies `bcrypt`-hashed `password_hash`; only `activo` users may sign in. Exports `auth`, `handlers`, `signIn`, `signOut`.
- `src/proxy.ts` — Next.js 16's middleware (renamed to **proxy** in this version). Runs `authConfig` on every request via its `matcher` to enforce login; static assets and logos are excluded. Edit this file, not `middleware.ts`.

Login page is `/login`; `UserWidget`/`Providers` wire the client session. `AUTH_SECRET` must be set. There is no public sign-up — the first admin is created via `db:seed` (which sets `ssanchez@vivancar.cl` as `admin`); after that, admins create users in the app.

### Roles & user management

`users.rol` is `'admin' | 'vendedor'` (default `vendedor`). The role is carried in the JWT and exposed on `session.user.rol` (see the jwt/session callbacks in `src/auth.ts` and the type augmentation in `src/types/next-auth.d.ts`).

- **`/usuarios`** (admin-only page) — server component redirects non-admins to `/cotizador`; the "Usuarios" navbar link only renders for admins (`Navbar` is an async server component that calls `auth()`).
- **`/api/usuarios`** — `GET` lists users (no `password_hash`), `POST` creates one. **`/api/usuarios/[id]`** — `PATCH` updates nombre/email/rol/activo/password, `DELETE` removes. Every handler re-checks `session.user.rol === 'admin'` server-side; this is the real authorization boundary (the navbar hiding and proxy login gate are not). Guards prevent an admin from demoting, deactivating, or deleting their own account (avoids lockout). Passwords are bcrypt-hashed (cost 12); on `PATCH`, password is only changed if a non-empty value is sent.

### Database setup (one-time)

1. Create project on [neon.tech](https://neon.tech) and get the `DATABASE_URL`
2. Add it to `.env.local`
3. Run `npm run db:push` to create tables via Drizzle
4. Run `db/setup.sql` in the Neon SQL Editor (adds quote numbering trigger and sequence — not managed by Drizzle)

### Key flows

1. **Catalog load** — `/catalogo`: upload Excel → `parseProductosExcel()` (client) → `POST /api/catalogo/importar` → upserts into `products` table (conflict on `codigo`). Admins can also manage products individually from this page: a "Nuevo producto"/"Editar" modal hits `POST /api/productos` and `PATCH /api/productos/[id]`, the Estado badge toggles `activo` inline (for stock-out), and the trash icon `DELETE`s. Those mutations are admin-only (server-checked); the page passes `isAdmin` to `CatalogoCliente` so vendedores still see the read-only catalog. Note `GET /api/productos` returns only `activo` products (used by the cotizador), while the catalog page server-loads all of them.

2. **Quote builder** — `/cotizador`: all state lives in Zustand (`src/store/cotizacion.ts`, persisted to `localStorage` under key `cotizacion-draft`). On save → `POST /api/cotizaciones` → writes `quotes` + `quote_items` → redirects to detail page. Client search/create via `BuscadorCliente`/`FormularioCliente` hits `/api/clientes` (GET searches by name/empresa/email/rut; POST upserts by RUT). RUTs are normalized through `src/lib/rut.ts` before storage.

3. **Quote detail + PDF** — `/cotizaciones/[id]`: server component queries Neon directly (Drizzle), renders `PreviewCotizacion` (HTML) and `DescargaPDF` (client button). PDF uses `@react-pdf/renderer` with dynamic import to avoid SSR issues (`serverExternalPackages` set in `next.config.ts`). PDF component: `DocumentoPDF.tsx`.

4. **Indicators** — `/api/indicadores` proxies SBIF API (UF + USD, 1h ISR cache). `SBIF_API_KEY` must stay server-side only. `IndicadoresBar` fetches from this route on mount.

### Database (Neon + Drizzle)

Schema in `src/lib/schema.ts`. Five tables:
- `users` — auth accounts; login checks `password_hash` (bcrypt) and `activo`. `rol` (`admin`/`vendedor`) gates user management.
- `clients` — saved customers; `rut` is the unique upsert key
- `products` — catalog with `codigo` as unique conflict target for upserts
- `quotes` — headers; `numero` (COT-001) and `correlativo` are set by the DB trigger in `db/setup.sql`, never set manually. `updated_at` is also trigger-maintained.
- `quote_items` — line items, cascade-deleted with their quote

**Important:** Drizzle returns `numeric` columns as strings. All server components and API routes must call `Number()` before returning data to the client.

### DB access pattern

- **Server components** → import `db` from `@/lib/db` directly
- **Client components** → fetch API routes only (Neon driver is server-only)
- API routes: `/api/productos` (GET), `/api/cotizaciones` (POST), `/api/catalogo/importar` (POST), `/api/clientes` (GET/POST), `/api/indicadores` (GET), `/api/auth/[...nextauth]` (NextAuth handlers)

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
AUTH_SECRET=...   # NextAuth JWT signing secret
```

### Brand

Vivancar: green `#8B9E45`, dark `#282828`. Logos in `public/logo.png` (dark bg) and `public/logo-blanco.png` (white bg, used in navbar).
