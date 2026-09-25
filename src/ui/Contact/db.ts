import { sql } from "@payloadcms/db-postgres";
import { lexicalToText, payloadClient } from "@/lib/payload";
import type { Office } from "./Offices";

type DbContact = { title: string | null; locations: (Partial<Office> & { label: string })[] };

/**
 * The live `contact` tables have drifted from the Payload config (address is rich text, phones/emails
 * live in `contact_texts`, extra `label` column), so `findGlobal({ slug: "contact" })` throws.
 * Read the rows directly (SELECT only) until the schema is reconciled.
 */
export async function getDbContact(): Promise<DbContact | null> {
  try {
    const payload = await payloadClient();
    const db = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<{ rows: Record<string, unknown>[] }> } }).drizzle;
    const [head, locs, texts] = await Promise.all([
      db.execute(sql`select title from contact limit 1`),
      db.execute(sql`select _order, title, label, address from contact_locations order by _order`),
      db.execute(sql`select "order", path, text from contact_texts order by "order"`),
    ]);
    const byPath = (p: string) => texts.rows.filter((t) => t.path === p).map((t) => String(t.text));
    return {
      title: (head.rows[0]?.title as string) ?? null,
      locations: locs.rows.map((l, i) => ({
        label: String(l.label ?? ""),
        company: (l.title as string) || undefined,
        address: lexicalToText(l.address, 1000) || undefined,
        phones: byPath(`locations.${i}.phones`),
        emails: byPath(`locations.${i}.emails`),
      })),
    };
  } catch (err) {
    console.error("[contact-us] failed to read contact tables", err);
    return null;
  }
}

/** DB values win for offices it knows about (matched by label); the rest come from the live scrape. */
export function mergeOffice(o: Office, db: DbContact | null): Office {
  const d = db?.locations.find((l) => l.label.toLowerCase() === o.label.toLowerCase());
  if (!d) return o;
  return {
    ...o,
    company: d.company || o.company,
    address: d.address || o.address,
    phones: d.phones?.length ? d.phones : o.phones,
    emails: d.emails?.length ? d.emails : o.emails,
  };
}
