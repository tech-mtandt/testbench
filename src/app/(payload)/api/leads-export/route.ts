/**
 * Excel export of website leads for the admin Leads page: the same filters as the page
 * (`show`, `from`, `to`, `q`), every matching lead, newest first. Editors and administrators
 * only, like the page itself and the lead file downloads.
 */
import config from "@payload-config";
import ExcelJS from "exceljs";
import { getPayload } from "payload";
import { canViewLeads, leadsPool } from "@/cms/admin/leadsAccess";
import { LEAD_FORMS } from "@/lib/lead-forms";
import { istDay, leadFileLink, leadQueryFrom, listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com";

/** Column per lead detail, then one per other submitted field. */
const BASE: { header: string; key: string; width: number }[] = [
  { header: "Received (IST)", key: "received", width: 18 },
  { header: "Form", key: "form", width: 20 },
  { header: "Name", key: "name", width: 24 },
  { header: "Phone", key: "phone", width: 18 },
  { header: "Email", key: "email", width: 30 },
  { header: "Company", key: "company", width: 26 },
  { header: "About", key: "product", width: 30 },
  { header: "Message", key: "message", width: 50 },
  { header: "Page", key: "page", width: 30 },
  { header: "Full address", key: "pageUrl", width: 40 },
  { header: "Came from", key: "referrer", width: 40 },
  { header: "Lead #", key: "id", width: 9 },
];
/** Submitted fields already in the columns above. */
const COVERED = new Set(["page", "pageUrl"]);

/** Excel shows dates as given, so IST wall-clock time is written as if it were UTC. */
const istDate = (d: Date) => new Date(d.getTime() + 330 * 60_000);

/** File entries become full download links (admin login needed to open them). */
const cell = (v: string) =>
  v
    .split("\n")
    .map((line) => {
      const f = leadFileLink(line);
      return f ? `${f.label} ${SITE_URL}${f.href}` : line;
    })
    .join("\n");

export async function GET(req: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers }).catch(() => ({ user: null }));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canViewLeads(payload, user))) return Response.json({ error: "Forbidden" }, { status: 403 });

  const query = leadQueryFrom(new URL(req.url).searchParams);
  const { rows } = await listLeads(leadsPool(payload), query, LEAD_FORMS, { limit: null });

  // A submitted field already shown in a detail column of its row (the name, phone, email… it was
  // read from) is left out; a field column empty in every row is dropped.
  const own = (r: (typeof rows)[number], k: string) => {
    const v = r.fields[k];
    if (!v || COVERED.has(k)) return null;
    const shown = [r.name, r.phone, r.email, r.company, r.product, r.message, r.page, r.pageUrl];
    return shown.includes(v) ? null : v;
  };
  const extra = [...new Set(rows.flatMap((r) => Object.keys(r.fields)))]
    .filter((k) => rows.some((r) => own(r, k)))
    .sort();

  const book = new ExcelJS.Workbook();
  book.creator = "mtandt.com admin";
  const sheet = book.addWorksheet("Leads", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [...BASE, ...extra.map((k) => ({ header: k, key: `f:${k}`, width: 24 }))];
  for (const r of rows) {
    sheet.addRow({
      received: istDate(r.createdAt),
      form: r.form,
      name: r.name,
      phone: r.phone,
      email: r.email,
      company: r.company,
      product: r.product,
      message: r.message,
      page: r.page,
      pageUrl: r.pageUrl,
      referrer: r.referrer,
      id: r.id,
      ...Object.fromEntries(extra.map((k) => [`f:${k}`, own(r, k) ? cell(r.fields[k]) : null])),
    });
  }
  sheet.getColumn("received").numFmt = "dd mmm yyyy hh:mm";
  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };

  const name = `mtandt-${query.show === "leads" ? "leads" : query.show === "all" ? "submissions" : query.show}-${istDay()}.xlsx`;
  return new Response(new Uint8Array(await book.xlsx.writeBuffer()), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
