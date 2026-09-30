import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// @payloadcms/plugin-seo: meta { title, description, image } on blogs (+ drafts),
// services and the about global. Hand-written (no local schema snapshot to diff
// against) and idempotent, so it is safe to re-run.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
    ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
    ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "meta_image_id" integer;

    ALTER TABLE "_blogs_v" ADD COLUMN IF NOT EXISTS "version_meta_title" varchar;
    ALTER TABLE "_blogs_v" ADD COLUMN IF NOT EXISTS "version_meta_description" varchar;
    ALTER TABLE "_blogs_v" ADD COLUMN IF NOT EXISTS "version_meta_image_id" integer;

    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "meta_image_id" integer;

    ALTER TABLE "about" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
    ALTER TABLE "about" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
    ALTER TABLE "about" ADD COLUMN IF NOT EXISTS "meta_image_id" integer;

    DO $$ BEGIN
      ALTER TABLE "blogs" ADD CONSTRAINT "blogs_meta_image_id_media_id_fk"
        FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "_blogs_v" ADD CONSTRAINT "_blogs_v_version_meta_image_id_media_id_fk"
        FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "services" ADD CONSTRAINT "services_meta_image_id_media_id_fk"
        FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN
      ALTER TABLE "about" ADD CONSTRAINT "about_meta_image_id_media_id_fk"
        FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "blogs_meta_meta_image_idx" ON "blogs" USING btree ("meta_image_id");
    CREATE INDEX IF NOT EXISTS "_blogs_v_version_meta_version_meta_image_idx" ON "_blogs_v" USING btree ("version_meta_image_id");
    CREATE INDEX IF NOT EXISTS "services_meta_meta_image_idx" ON "services" USING btree ("meta_image_id");
    CREATE INDEX IF NOT EXISTS "about_meta_meta_image_idx" ON "about" USING btree ("meta_image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "blogs" DROP COLUMN IF EXISTS "meta_title";
    ALTER TABLE "blogs" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "blogs" DROP COLUMN IF EXISTS "meta_image_id";

    ALTER TABLE "_blogs_v" DROP COLUMN IF EXISTS "version_meta_title";
    ALTER TABLE "_blogs_v" DROP COLUMN IF EXISTS "version_meta_description";
    ALTER TABLE "_blogs_v" DROP COLUMN IF EXISTS "version_meta_image_id";

    ALTER TABLE "services" DROP COLUMN IF EXISTS "meta_title";
    ALTER TABLE "services" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "services" DROP COLUMN IF EXISTS "meta_image_id";

    ALTER TABLE "about" DROP COLUMN IF EXISTS "meta_title";
    ALTER TABLE "about" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "about" DROP COLUMN IF EXISTS "meta_image_id";
  `)
}
