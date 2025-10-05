# QR Menu Platform Documentation

This documentation set is intended to let you (or a new maintainer) revive, extend, or audit the system even after years away. It covers:

- High‑level product vision & feature set
- Architecture & technology stack rationale
- Domain & data model (ER + Prisma specifics)
- Runtime flows (SSR, theming, working hours, image lifecycle, cart)
- API surface (REST endpoints with contracts)
- Theming & font pipeline
- Dynamic categories migration (Phase 1 & suggested Phase 2)
- Seeding & environment bootstrap
- Operational playbooks (deploy, rotate secrets, storage maintenance)
- Testing checklist & manual QA scripts
- Performance & future extension notes

> Additional deep‑dive files live alongside this index inside `doc/`.

## Directory Map

| File | Purpose |
|------|---------|
| `architecture.md` | System context, layered architecture, request flow diagrams. |
| `data-model.md` | Prisma schema explanation, ER diagram, field semantics, future migrations. |
| `apis.md` | REST endpoints (admin & public), request/response contracts, validation rules. |
| `theming-fonts.md` | Brand color, dynamic theme & font propagation (SSR headers and data attributes). |
| `working-hours.md` | Timezone handling, open status computation, hydration stability strategy. |
| `categories-migration.md` | Dynamic categories design + stepwise migration plan (Phase 2). |
| `images-storage.md` | Cloudflare R2 integration, upload & cleanup lifecycle. |
| `seeding.md` | Seed scripts, idempotent population, category bootstrap. |
| `operations.md` | Environment variables, deploy steps, backup & recovery procedures. |
| `qa-testing.md` | Manual test scenarios & regression checklist. |
| `performance-future.md` | Current perf posture & optimization backlog. |
| `uml.md` | UML style diagrams (text PlantUML / Mermaid) for system, sequence, and component views. |

Each document is standalone; skim `architecture.md` first if you are re‑orienting.

## Quick Start (2 Minute Refresher)

1. Install deps: `npm install`
2. Provision `.env` (see `operations.md` – copy `.env.example` if present) with `DATABASE_URL`, `R2_*` keys, `ADMIN_PASSWORD`.
3. Run migrations: `npx prisma migrate deploy` (production) or `npx prisma migrate dev` (local).
4. Seed (optional dev): `node scripts/seed-store.mjs && node scripts/seed-items.mjs` (after updating them per `seeding.md`).
5. Start dev server: `npm run dev`.
6. Visit `/admin/login` (enter admin password) then manage categories, items, and special offers.
7. Public menu: `/` (Arabic RTL, dynamic theming & font).

## Core Feature Inventory

- Arabic RTL SSR menu (Next.js App Router) with dynamic categories & special offers.
- Server‑stored theming (brand color + light/dark) & font style (classic/elegant) applied before hydration.
- Working hours with timezone‑aware open/close countdown label (hydration-safe snapshot strategy).
- Calculator-style cart (client state) separate from persistent orders (future extension point).
- Cloudflare R2 image upload + old image cleanup.
- Date‑ranged special offers with category scoping.
- Deterministic social/contact fallback links to avoid hydration mismatch.

## High-Level Architecture Summary

```
[Browser]
  | (HTTP - Next.js routes)
[Next.js App Router]
  |-- Server Components (SSR data fetch: Store, Categories, Items, Specials)
  |-- API Routes (/api/admin/*, /api/brand)
  |--> Prisma Client (Postgres)
  |--> R2 (S3-compatible) for images
```

- Most rendering is SSR (force-dynamic home) ensuring up-to-date offers & working-hours labels.
- Admin panel is a single client entry with internal panels (theme, menu, offers).

## Migration Status Note

Dynamic categories Phase 1 complete: `CategoryModel` + `categoryId` on `Item`/`SpecialItem`. Legacy enum removed from code usage; Phase 2 (dropping enum column if still present in DB) described in `categories-migration.md`.

## Security Snapshot

- Auth: Simple password-based admin login (session cookie). Strengthen with rate limiting & 2FA for production.
- Uploads: Direct to R2 via server route (validates store context; consider mime validation & size limits).
- Prisma: Scoped queries by `storeId` (single-store instance currently). Multi-tenant extension described in `architecture.md`.

## Contributing Checklist

Before opening PR:
- Run `npm run lint` (ensure zero errors)
- Run `npx prisma format && npx prisma validate`
- Ensure added endpoints documented in `apis.md`
- Update `data-model.md` for schema changes
- Add/adjust seeds if introducing new required data

## Future Extension Seeds

See `performance-future.md` for caching, image optimization, order persistence, and multi-store roadmap.

---

Return to `architecture.md` next for deeper diagrams & flows.
