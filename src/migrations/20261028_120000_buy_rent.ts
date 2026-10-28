import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// One product per machine: "Available to buy" / "Available to rent" replace the single buy-or-rent
// field, old addresses that redirect to a product (its former rent page), and the link from a
// merged rent page to its machine. DDL from migration/schema-sql.mts (`products`), cut to the new
// parts, idempotent. Inline so the deployed app can run it (admin > Apply database updates).
const DDL = `
CREATE TABLE IF NOT EXISTS "products_former_slugs" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"slug" varchar NOT NULL,
	"rent" boolean
);
ALTER TABLE "products_former_slugs" ADD COLUMN IF NOT EXISTS "_order" integer;
ALTER TABLE "products_former_slugs" ADD COLUMN IF NOT EXISTS "_parent_id" integer;
ALTER TABLE "products_former_slugs" ADD COLUMN IF NOT EXISTS "id" varchar;
ALTER TABLE "products_former_slugs" ADD COLUMN IF NOT EXISTS "slug" varchar;
ALTER TABLE "products_former_slugs" ADD COLUMN IF NOT EXISTS "rent" boolean;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "for_sale" boolean;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "for_rent" boolean;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "merged_into_id" integer;
DO $$ BEGIN
  ALTER TABLE "products_former_slugs" ADD CONSTRAINT "products_former_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN null;
  WHEN others THEN RAISE NOTICE 'skipped (%): %', SQLERRM, 'ALTER TABLE "products_former_slugs" ADD CONSTRAINT "products_former_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFER'; END $$;
DO $$ BEGIN
  ALTER TABLE "products" ADD CONSTRAINT "products_merged_into_id_products_id_fk" FOREIGN KEY ("merged_into_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN null;
  WHEN others THEN RAISE NOTICE 'skipped (%): %', SQLERRM, 'ALTER TABLE "products" ADD CONSTRAINT "products_merged_into_id_products_id_fk" FOREIGN KEY ("merged_into_id") REFERENCES'; END $$;
CREATE INDEX IF NOT EXISTS "products_former_slugs_order_idx" ON "products_former_slugs" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "products_former_slugs_parent_id_idx" ON "products_former_slugs" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "products_former_slugs_slug_idx" ON "products_former_slugs" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "products_for_sale_idx" ON "products" USING btree ("for_sale");
CREATE INDEX IF NOT EXISTS "products_for_rent_idx" ON "products" USING btree ("for_rent");
CREATE INDEX IF NOT EXISTS "products_merged_into_idx" ON "products" USING btree ("merged_into_id");
-- Until the buy/rent merge runs, every product keeps its one mode: the site looks the same.
UPDATE "products" SET "for_sale" = ("mode" = 'buy'), "for_rent" = ("mode" = 'rent')
  WHERE "mode" IS NOT NULL AND "for_sale" IS NULL AND "for_rent" IS NULL;
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(DDL))
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Additive only; the old buy-or-rent field is kept, so nothing needs undoing.
}
