/**
 * Website leads (every public form), stored in the site's Supabase Postgres database in the
 * `website_leads` table. Browse/export them in Supabase > Table Editor.
 *
 * The table sits outside Payload's schema (no migration or admin screen yet), so it is
 * created on first use. Row level security is on with no policies: only the app's own
 * database role (the table owner) can read or write it, not Supabase's public API keys.
 */
const DDL = `
CREATE TABLE IF NOT EXISTS website_leads (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  form text NOT NULL,
  page text,
  page_url text,
  referrer text,
  name text,
  phone text,
  email text,
  company text,
  product text,
  message text,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC);
ALTER TABLE website_leads ENABLE ROW LEVEL SECURITY;`;

/** The pg Pool behind Payload's Postgres adapter (`payload.db.pool`). */
export type Db = { query: (sql: string, params?: unknown[]) => Promise<unknown> };

export type Lead = { form: string; fields: [string, string][]; referrer?: string | null };

const pick = (fields: [string, string][], ...keys: string[]) => {
  for (const k of keys) {
    const v = fields.find(([f]) => f === k)?.[1];
    if (v) return v;
  }
  return null;
};

let ready: Promise<void> | null = null;

/** Inserts a lead; throws if the database is unreachable. */
export async function saveLead(pool: Db, { form, fields, referrer }: Lead): Promise<void> {
  ready ??= pool.query(DDL).then(
    () => undefined,
    (err: unknown) => {
      ready = null; // retry next time; the insert below still runs (the table may exist)
      console.error("[leads] create table failed", err);
    },
  );
  await ready;

  const first = pick(fields, "firstName");
  const last = pick(fields, "lastName");
  const page = pick(fields, "page");
  await pool.query(
    `INSERT INTO website_leads (form, page, page_url, referrer, name, phone, email, company, product, message, fields)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      form,
      page && `/${page.replace(/^\//, "")}`,
      pick(fields, "pageUrl"),
      referrer ?? null,
      pick(fields, "name", "fullName") ?? ([first, last].filter(Boolean).join(" ") || null),
      pick(fields, "mobile", "phone", "number"),
      pick(fields, "email"),
      pick(fields, "companyName", "company"),
      pick(fields, "product", "catalogName", "productName"),
      pick(fields, "message", "enquiry"),
      JSON.stringify(Object.fromEntries(fields)),
    ],
  );
}
