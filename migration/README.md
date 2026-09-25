# mtandt migration runbook

ETL from the legacy Laravel/MySQL DB (`mtandt_local` @ 127.0.0.1:3306) into this
Payload/Postgres (Supabase) app. See `../../MIGRATION_ANALYSIS.md` for the full plan.

## Prerequisites
- Local MySQL 8.4 running with `mtandt_local` loaded.
- `testbench/.env` has a working `DATABASE_URL` (Supabase) + `PAYLOAD_SECRET`.
- For media: `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.

## Why the odd run command
This Node 22 + Next 16 + Payload 3 + tsx toolchain has two interop landmines that
break the standard `payload` CLI, so scripts run via the Local API with a shim:
- `patch-next-env.cjs` — adds the missing default export to `@next/env` (payload's
  `loadEnv` default-imports it; fine under Next's bundler, `undefined` under tsx).
- scripts are `.mts` (ESM) and boot Payload via `getPayload` (see `lib/payload.mts`).
- `@payloadcms/storage-s3` is pinned to `3.85.1` to match core (dependency checker).

Standard invocation:
```
node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/<script>.mts
```
(prefix `NODE_OPTIONS=--no-deprecation`; prefix `LIMIT=N` on the product import for a sample)

## ⚠️ Schema changes = MIGRATIONS, never dev-push
Payload dev-mode `push:true` is DESTRUCTIVE here: it recreates Postgres enum types
when the enum set changes (adding any collection with a `select` field) and cascades
to DROP every table using an enum — it wiped all content once. The config now sets
`push:false` + `migrationDir: src/migrations`. **Any collection/field change must go
through migrations:**

1. Edit the collection/config.
2. Generate the migration:
   `MIG_NAME=<name> node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/make-migration.mts`
3. Apply it:
   `node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/migrate-run.mts`
4. Then run the data ETL.

The Payload CLI (`payload migrate:*`) silently no-ops in this toolchain — use the
`make-migration.mts` / `migrate-run.mts` Local-API scripts instead. Baseline
(`20260811_193641_baseline`) captures the pre-migration schema and is marked applied.

## Order of operations
1. **Schema push** — `migration/bootstrap.mts` (booting Payload in dev pushes the
   schema to Postgres; also a smoke test that prints collection counts).
2. **Taxonomy** — `migration/import-taxonomy.mts` → categories, applications,
   industries, brands. Idempotent (upsert by `legacyId`).
3. **Products** — `migration/import-products.mts` → merges buy/rent (catType 1/2)
   into one doc, resolves category/application/industry relations, maps spec columns,
   sets draft/published. Idempotent. Run in background (network-bound, ~3–4 min).
4. **Media** — TODO (needs S3 creds). Then backfill product `mainImage`/`gallery`/
   `catalogue` and industry images by re-joining MySQL on `legacySourceIds`/`legacyId`.

## Status (done)
- categories 43, applications 19, industries 8, brands 17
- products 197 (40 published, 157 draft) — merged from 328 legacy rows

## Known follow-ups
- Product→brand link deferred (`products.brandId` empty; `brand_manf` text needs a pass).
- Descriptions imported as plain text into `shortDescription`; rich HTML→Lexical TODO.
- `payload-types.ts` regeneration blocked by the CLI interop issue (cosmetic TS only).
- Remaining content collections (blogs, services, case studies, media/press, pages).
- Leads collections + ecommerce/checkout (see MIGRATION_ANALYSIS.md §5–6).

## Files
- `patch-next-env.cjs` — interop shim (preload)
- `lib/payload.mts` — `boot()` + `upsertByLegacyId()`
- `lib/mysql.mts` — MySQL connection + `parseIdArray()` / `clean()`
- `bootstrap.mts` — schema push / smoke test
- `import-taxonomy.mts`, `import-products.mts` — ETL
- `verify-sample.mts` — prints a few imported products with resolved relations
- `pgcheck.mjs` — lists Supabase public tables
