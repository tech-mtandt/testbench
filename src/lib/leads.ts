/**
 * Website leads (every public form), stored in the site's Supabase Postgres database in the
 * `website_leads` table, with uploaded files (CVs, partner documents) in `website_lead_files`.
 * Editors browse and export them on the admin Leads page (/admin/leads, cms/admin/LeadsView);
 * files download from /api/lead-files/<id> (admin login required).
 *
 * The tables sit outside Payload's schema (no migration or collection), so they are created on
 * first use. Keep Payload's dev schema push off (payload.config `push: false`): it offers to drop
 * tables it doesn't know, these included. Row level security is on with no policies: only the app's own
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

/** Filters for browsing leads (admin Leads page and its Excel export); dates are IST calendar days. */
export type LeadQuery = {
  /** "leads" = sales lead forms only (LEAD_FORMS), "all" = every form, else one form name. */
  show: string;
  from: string | null;
  to: string | null;
  q: string | null;
};

export type LeadRow = {
  id: number;
  createdAt: Date;
  form: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  product: string | null;
  message: string | null;
  page: string | null;
  pageUrl: string | null;
  referrer: string | null;
  fields: Record<string, string>;
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The IST calendar day `days` days ago, as YYYY-MM-DD (0 = today in India). */
export const istDay = (days = 0) => new Date(Date.now() + 330 * 60_000 - days * 86_400_000).toISOString().slice(0, 10);

/** Reads a LeadQuery from URL search params, ignoring anything malformed. */
export function leadQueryFrom(params: Record<string, string | string[] | undefined> | URLSearchParams): LeadQuery {
  const get = (k: string) => {
    const v = params instanceof URLSearchParams ? params.get(k) : params[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || null;
  };
  const show = get("show");
  const from = get("from");
  const to = get("to");
  return {
    show: show && /^[\w-]{1,40}$/.test(show) ? show : "leads",
    from: from && DAY.test(from) ? from : null,
    to: to && DAY.test(to) ? to : null,
    q: get("q")?.slice(0, 100) ?? null,
  };
}

function leadWhere(query: LeadQuery, leadForms: ReadonlySet<string>) {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    where.push(sql.replace("?", `$${params.length}`));
  };
  if (query.show === "leads") add("form = ANY(?)", [...leadForms]);
  else if (query.show !== "all") add("form = ?", query.show);
  if (query.from) add("created_at >= (?::date)::timestamp AT TIME ZONE 'Asia/Kolkata'", query.from);
  if (query.to) add("created_at < ((?::date) + 1)::timestamp AT TIME ZONE 'Asia/Kolkata'", query.to);
  if (query.q) {
    const like = `%${query.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    add("concat_ws(' ', name, phone, email, company, product, message, page, form, fields::text) ILIKE ?", like);
  }
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

const noLeadsYet = (err: { code?: string }) => {
  if (err.code === "42P01") return { rows: [] }; // undefined_table: no lead stored yet
  throw err;
};

const toLeadRow = (r: Record<string, unknown>): LeadRow => ({
  id: Number(r.id),
  createdAt: new Date(r.created_at as string),
  form: String(r.form),
  name: (r.name as string | null) ?? null,
  phone: (r.phone as string | null) ?? null,
  email: (r.email as string | null) ?? null,
  company: (r.company as string | null) ?? null,
  product: (r.product as string | null) ?? null,
  message: (r.message as string | null) ?? null,
  page: (r.page as string | null) ?? null,
  pageUrl: (r.page_url as string | null) ?? null,
  referrer: (r.referrer as string | null) ?? null,
  fields: (r.fields as Record<string, string> | null) ?? {},
});

/**
 * Leads matching `query`, newest first: one page (`limit`/`offset`), or all of them when `limit`
 * is null (export). `total` counts every match.
 */
export async function listLeads(
  pool: Db,
  query: LeadQuery,
  leadForms: ReadonlySet<string>,
  { limit, offset = 0 }: { limit: number | null; offset?: number },
): Promise<{ rows: LeadRow[]; total: number }> {
  const { sql, params } = leadWhere(query, leadForms);
  const page = limit === null ? "" : ` LIMIT ${Math.max(1, Math.floor(limit))} OFFSET ${Math.max(0, Math.floor(offset))}`;
  const [{ rows }, count] = await Promise.all([
    pool
      .query(
        `SELECT id, created_at, form, name, phone, email, company, product, message, page, page_url, referrer, fields
         FROM website_leads ${sql} ORDER BY created_at DESC, id DESC${page}`,
        params,
      )
      .catch(noLeadsYet),
    pool.query(`SELECT count(*)::int AS n FROM website_leads ${sql}`, params).catch(noLeadsYet),
  ]);
  return { rows: rows.map(toLeadRow), total: Number(count.rows[0]?.n ?? 0) };
}

/** One lead by id, or null. */
export async function getLead(pool: Db, id: number): Promise<LeadRow | null> {
  const { rows } = await pool
    .query(
      `SELECT id, created_at, form, name, phone, email, company, product, message, page, page_url, referrer, fields
       FROM website_leads WHERE id = $1`,
      [id],
    )
    .catch(noLeadsYet);
  return rows[0] ? toLeadRow(rows[0]) : null;
}

/** Every form that has stored submissions, with how many, most first. */
export async function leadFormCounts(pool: Db): Promise<{ form: string; n: number }[]> {
  const { rows } = await pool
    .query(`SELECT form, count(*)::int AS n FROM website_leads GROUP BY form ORDER BY n DESC, form`)
    .catch(noLeadsYet);
  return rows.map((r) => ({ form: String(r.form), n: Number(r.n) }));
}

/** "[file] cv.pdf (120 KB) /api/lead-files/7" -> its label and download path, else null. */
export function leadFileLink(value: string): { label: string; href: string } | null {
  const m = value.match(/^\[file\] (.+) (\/api\/lead-files\/\d+)$/);
  return m ? { label: m[1], href: m[2] } : null;
}
