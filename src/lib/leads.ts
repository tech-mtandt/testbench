/**
 * Website leads (every public form), stored in the site's Supabase Postgres database in the
 * `website_leads` table, with uploaded files (CVs, partner documents) in `website_lead_files`.
 * Browse/export them in Supabase > Table Editor; files download from /api/lead-files/<id>
 * (admin login required).
 *
 * The tables sit outside Payload's schema (no migration or admin screen yet), so they are
 * created on first use. Row level security is on with no policies: only the app's own
 * database role (the table owner) can read or write them, not Supabase's public API keys.
 */
import { isEmailKey, isPhoneKey } from "@/lib/form-rules";

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
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS ip text;
CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS website_leads_ip_idx ON website_leads (ip, created_at DESC);
ALTER TABLE website_leads ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS website_lead_files (
  id bigserial PRIMARY KEY,
  lead_id bigint NOT NULL REFERENCES website_leads(id) ON DELETE CASCADE,
  field text NOT NULL,
  filename text NOT NULL,
  content_type text,
  size int NOT NULL,
  data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS website_lead_files_lead_id_idx ON website_lead_files (lead_id);
ALTER TABLE website_lead_files ENABLE ROW LEVEL SECURITY;`;

type Query = (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;

/** The pg Pool behind Payload's Postgres adapter (`payload.db.pool`). */
export type Db = { query: Query; connect: () => Promise<{ query: Query; release: () => void }> };

/** An uploaded file; `index` is its "[file] name (N KB)" entry in the lead's fields. */
export type LeadFile = { index: number; field: string; filename: string; contentType: string; data: Uint8Array };

export type Lead = {
  form: string;
  fields: [string, string][];
  files?: LeadFile[];
  referrer?: string | null;
  ip?: string | null;
};

export const leadFilePath = (id: unknown) => `/api/lead-files/${id}`;

const pick = (fields: [string, string][], ...keys: string[]) => {
  for (const k of keys) {
    const v = fields.find(([f]) => f === k)?.[1];
    if (v) return v;
  }
  return null;
};

const pickBy = (fields: [string, string][], test: (k: string) => boolean) =>
  fields.find(([k, v]) => v && test(k))?.[1] ?? null;

/**
 * Who sent a lead. The forms name these fields differently (the partner forms come from the
 * CMS), so known names win and any field named like one is the fallback.
 */
export function leadContact(fields: [string, string][]) {
  const first = pick(fields, "firstName");
  const last = pick(fields, "lastName");
  const name =
    pick(fields, "name", "fullName") ??
    ([first, last].filter(Boolean).join(" ") ||
      pick(fields, "name_director", "contact_person", "name_firm") ||
      pickBy(fields, (k) => /name/i.test(k)));
  return {
    name,
    phone: pick(fields, "mobile", "phone") ?? pickBy(fields, isPhoneKey),
    email: pick(fields, "email") ?? pickBy(fields, isEmailKey),
  };
}

/** Same keys in one JSON object (e.g. several files under one field) are joined, not dropped. */
const toJson = (fields: [string, string][]) => {
  const out: Record<string, string> = {};
  for (const [k, v] of fields) out[k] = k in out ? `${out[k]}\n${v}` : v;
  return JSON.stringify(out);
};

let ready: Promise<void> | null = null;

function ensureTables(pool: Db) {
  ready ??= pool.query(DDL).then(
    () => undefined,
    (err: unknown) => {
      ready = null; // retry next time; the queries below still run (the tables may exist)
      console.error("[leads] create tables failed", err);
    },
  );
  return ready;
}

/**
 * Inserts a lead and its files in one transaction; throws if the database is unreachable.
 * Returns the lead id and its fields with each file's download path appended.
 */
export async function saveLead(
  pool: Db,
  { form, fields, files = [], referrer, ip }: Lead,
): Promise<{ id: number; fields: [string, string][] }> {
  await ensureTables(pool);

  const page = pick(fields, "page");
  const who = leadContact(fields);
  const out = fields.map(([k, v]): [string, string] => [k, v]);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO website_leads (form, page, page_url, referrer, name, phone, email, company, product, message, fields, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        form,
        page && `/${page.replace(/^\//, "")}`,
        pick(fields, "pageUrl"),
        referrer ?? null,
        who.name,
        who.phone,
        who.email,
        pick(fields, "companyName", "company", "companyname", "company_name", "name_firm"),
        pick(fields, "product", "catalogName", "productName"),
        pick(fields, "message", "enquiry", "feedback"),
        toJson(fields),
        ip ?? null,
      ],
    );
    const id = Number(rows[0].id);
    for (const f of files) {
      const r = await client.query(
        `INSERT INTO website_lead_files (lead_id, field, filename, content_type, size, data)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [id, f.field, f.filename, f.contentType || null, f.data.byteLength, Buffer.from(f.data)],
      );
      out[f.index][1] = `${out[f.index][1]} ${leadFilePath(r.rows[0].id)}`;
    }
    if (files.length) await client.query(`UPDATE website_leads SET fields = $2 WHERE id = $1`, [id, toJson(out)]);
    await client.query("COMMIT");
    return { id, fields: out };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/** Leads stored from this IP address in the last `minutes` (rate limiting). */
export async function recentLeads(pool: Db, ip: string, minutes: number): Promise<number> {
  await ensureTables(pool);
  const { rows } = await pool.query(
    `SELECT count(*)::int AS n FROM website_leads WHERE ip = $1 AND created_at > now() - make_interval(mins => $2::int)`,
    [ip, minutes],
  );
  return Number(rows[0]?.n ?? 0);
}

/** An uploaded file by id, or null (also before the table exists). */
export async function getLeadFile(pool: Db, id: string) {
  const { rows } = await pool
    .query(`SELECT filename, content_type, data FROM website_lead_files WHERE id = $1`, [id])
    .catch((err: { code?: string }) => {
      if (err.code === "42P01") return { rows: [] }; // undefined_table: nothing uploaded yet
      throw err;
    });
  const row = rows[0];
  if (!row) return null;
  return { filename: String(row.filename), contentType: (row.content_type as string | null) ?? null, data: row.data as Buffer };
}
