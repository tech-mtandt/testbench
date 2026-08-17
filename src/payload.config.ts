import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
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
  ],
  globals: [Home, About, Contact],
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
      ssl: { rejectUnauthorized: false },
    },
  }),
  sharp,
  plugins: [],
});
