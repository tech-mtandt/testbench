import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { seoPlugin } from "@payloadcms/plugin-seo";
import path from "path";
import { buildConfig, type CollectionConfig, type CollectionSlug, type GlobalConfig, type GlobalSlug } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Documents } from "./collections/Documents";
import { Brands } from "./collections/Brands";
import { Socials } from "./collections/Socials";
import { Products } from "./collections/Products";
import { Services } from "./collections/Services";
import { Partnership } from "./collections/Partnership";
import { Catalogues } from "./collections/Catalogues";
import { Blogs } from "./collections/Blogs";
import { Careers } from "./collections/Careers";
import { Press } from "./collections/Press";
import { Events } from "./collections/Events";
import { Gallery } from "./collections/Gallery";
import { Home } from "./globals/Home";
import { About } from "./globals/About";
import { Contact } from "./globals/Contact";
import { areas } from "./cms/schema";
import { collectionRevalidate, globalRevalidate } from "./cms/hooks";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Supabase Storage (S3-compatible). Enabled only when S3_* creds are set,
// so the app still boots on local disk before storage is configured.
const storagePlugins = process.env.S3_BUCKET
  ? [
      s3Storage({
        collections: { media: true },
        bucket: process.env.S3_BUCKET,
        config: {
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION || "us-east-1",
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
          },
          forcePathStyle: true,
        },
      }),
    ]
  : [];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com";

// Per-page SEO (meta title, description, share image) on an "SEO" tab. Empty
// fields fall back to the legacy site's meta in each page's generateMetadata.
// Adding a collection/global here adds meta_* columns: write a migration.
const seo = seoPlugin({
  collections: ["blogs", "services", ...areas.flatMap((a) => a.seo?.collections ?? [])] as CollectionSlug[],
  globals: ["about", ...areas.flatMap((a) => a.seo?.globals ?? [])] as GlobalSlug[],
  uploadsCollection: "media",
  tabbedUI: true,
  // Meta titles are used verbatim (absolute), so include the brand suffix here.
  generateTitle: ({ doc }) => (doc?.title ? `${doc.title} | MTandT` : "MTandT"),
  generateDescription: ({ doc }) => doc?.excerpt || "",
  generateURL: ({ doc, collectionSlug, globalSlug }) => {
    for (const a of areas) {
      const p = a.seo?.url?.({ collectionSlug, globalSlug, doc });
      if (p) return `${SITE_URL}${p}`;
    }
    if (globalSlug === "about") return `${SITE_URL}/about-us`;
    return `${SITE_URL}/${collectionSlug}/${doc?.slug ?? ""}`;
  },
});

// Every admin change refreshes the site (see cms/hooks).
const withRevalidate = (c: CollectionConfig): CollectionConfig => ({
  ...c,
  hooks: {
    ...c.hooks,
    afterChange: [...(c.hooks?.afterChange ?? []), ...collectionRevalidate.afterChange],
    afterDelete: [...(c.hooks?.afterDelete ?? []), ...collectionRevalidate.afterDelete],
  },
});
const withGlobalRevalidate = (g: GlobalConfig): GlobalConfig => ({
  ...g,
  hooks: { ...g.hooks, afterChange: [...(g.hooks?.afterChange ?? []), ...globalRevalidate.afterChange] },
});

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ["/cms/admin/ImportPanel#ImportPanel"],
    },
  },
  collections: [
    Catalogues,
    Partnership,
    Products,
    Services,
    Blogs,
    Careers,
    Documents,
    Events,
    Gallery,
    Media,
    Press,
    Brands,
    Socials,
    Users,
    ...areas.flatMap((a) => a.collections ?? []),
  ].map(withRevalidate),
  globals: [Home, About, Contact, ...areas.flatMap((a) => a.globals ?? [])].map(withGlobalRevalidate),
  editor: lexicalEditor(),
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || "",
    defaultFromAddress: process.env.RESEND_DEFAULT_FROM_ADDRESS || "",
    defaultFromName: process.env.RESEND_DEFAULT_FROM_NAME || "",
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
      // Supabase's pooler caps clients (15 in session mode); each build worker /
      // serverless instance opens its own pool, so keep it small.
      max: Number(process.env.DATABASE_POOL_MAX || 2),
      ssl: { rejectUnauthorized: false },
    },
    // Safety: never auto-sync/alter the live schema on boot. Dev-push hit an
    // ambiguous rename prompt (contact_locations) and can drop/recreate columns.
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  sharp,
  plugins: [...storagePlugins, seo],
});
