import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";
import { LEAD_FORMS } from "@/lib/lead-forms";
import { getLead, leadFileLink, leadFormCounts, leadQueryFrom, listLeads, type LeadQuery, type LeadRow } from "@/lib/leads";
import { canViewLeads, leadsPool } from "./leadsAccess";

const PER_PAGE = 50;
const BASE = "/admin/leads";

/** Fields shown in their own columns or rows, so the "All fields" list leaves them out. */
const SHOWN = new Set(["page", "pageUrl"]);

const ist = (d: Date) =>
  d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** The current filters as a query string, with `extra` set or removed (null). */
function href(query: LeadQuery, extra: Record<string, string | number | null> = {}, base = BASE) {
  const p = new URLSearchParams();
  if (query.show !== "leads") p.set("show", query.show);
  if (query.from) p.set("from", query.from);
  if (query.to) p.set("to", query.to);
  if (query.q) p.set("q", query.q);
  for (const [k, v] of Object.entries(extra)) {
    if (v === null) p.delete(k);
    else p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

/** A field value: uploaded files become download links (admin login), other text keeps its line breaks. */
function Value({ value }: { value: string }) {
  const lines = value.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const file = leadFileLink(line);
        return (
          <span key={i} className="leads__line">
            {file ? (
              <a href={file.href} download>
                {file.label}
              </a>
            ) : /^https?:\/\//.test(line) ? (
              <a href={line} target="_blank" rel="noreferrer">
                {line}
              </a>
            ) : (
              line
            )}
          </span>
        );
      })}
    </>
  );
}

function Detail({ lead, back }: { lead: LeadRow; back: string }) {
  const rows: [string, React.ReactNode][] = [
    ["Received (IST)", ist(lead.createdAt)],
    ["Form", lead.form],
    ["Page", lead.page],
    ["Full address", lead.pageUrl && <Value value={lead.pageUrl} />],
    ["Came from", lead.referrer && <Value value={lead.referrer} />],
  ];
  const fields = Object.entries(lead.fields).filter(([k, v]) => v && !SHOWN.has(k));
  return (
    <section className="leads__detail" aria-labelledby="lead-title">
      <p>
        <Link href={back}>← Back to the list</Link>
      </p>
      <h2 id="lead-title">
        {lead.name || "(no name)"} <span className="leads__muted">· lead #{lead.id}</span>
      </h2>
      <p className="leads__contact">
        {lead.phone && <a href={`tel:${lead.phone.replace(/\s/g, "")}`}>{lead.phone}</a>}
        {lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}
      </p>
      <dl className="leads__dl">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
      </dl>
      <h3>Everything they submitted</h3>
      <dl className="leads__dl">
        {fields.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>
              <Value value={v} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Admin page listing the website's form submissions (the `website_leads` table, outside
 * Payload's collections): newest first, filtered by form, IST date range and a search, with one
 * lead's full details (`?id=`) and an Excel export of the current filter. Read-only.
 */
export async function LeadsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  const { payload, user } = req;
  if (!user) redirect(`/admin/login?redirect=${encodeURIComponent(BASE)}`);
  if (!(await canViewLeads(payload, user))) notFound();

  const sp = (searchParams ?? {}) as Record<string, string | string[] | undefined>;
  const query = leadQueryFrom(sp);
  const pageNo = Math.max(1, Number(sp.page) || 1);
  const id = Number(sp.id) || null;
  const pool = leadsPool(payload);

  const [lead, list, forms] = await Promise.all([
    id ? getLead(pool, id) : null,
    id ? null : listLeads(pool, query, LEAD_FORMS, { limit: PER_PAGE, offset: (pageNo - 1) * PER_PAGE }),
    leadFormCounts(pool),
  ]);
  const pages = list ? Math.max(1, Math.ceil(list.total / PER_PAGE)) : 1;
  const filtered = query.show !== "leads" || query.from || query.to || query.q;

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <Gutter className="leads">
        <style>{CSS}</style>
        <header className="leads__head">
          <h1>Leads</h1>
          <p className="leads__muted">Every form submitted on the website, newest first. Times are India time (IST). Read-only.</p>
        </header>

        {id ? (
          lead ? (
            <Detail lead={lead} back={href(query, { id: null, page: pageNo > 1 ? pageNo : null })} />
          ) : (
            <p>
              Lead #{id} was not found. <Link href={href(query, { id: null })}>Back to the list</Link>
            </p>
          )
        ) : (
          <>
            <form className="leads__filters" action={BASE} method="get">
              <label>
                <span>Show</span>
                <select name="show" defaultValue={query.show}>
                  <option value="leads">Sales leads</option>
                  <option value="all">All submissions</option>
                  {forms.length > 0 && (
                    <optgroup label="One form">
                      {forms.map((f) => (
                        <option key={f.form} value={f.form}>
                          {f.form} ({f.n})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </label>
              <label>
                <span>From</span>
                <input type="date" name="from" defaultValue={query.from ?? ""} />
              </label>
              <label>
                <span>To</span>
                <input type="date" name="to" defaultValue={query.to ?? ""} />
              </label>
              <label className="leads__search">
                <span>Search</span>
                <input type="search" name="q" defaultValue={query.q ?? ""} placeholder="Name, phone, email, company, product…" />
              </label>
              <button type="submit" className="leads__button">
                Apply
              </button>
              {filtered && <Link href={BASE}>Clear</Link>}
              <a className="leads__button leads__button--secondary" href={href(query, {}, "/api/leads-export")} download>
                Export to Excel
              </a>
            </form>

            <p className="leads__muted" role="status">
              {list!.total.toLocaleString("en-IN")} {list!.total === 1 ? "result" : "results"}
              {pages > 1 && ` · page ${pageNo} of ${pages}`}
              {query.show === "leads" && " · sales lead forms only (career, partner, feedback and newsletter forms are under All submissions)"}
            </p>

            {list!.rows.length === 0 ? (
              <p>No submissions match these filters.</p>
            ) : (
              <div className="leads__scroll">
                <table className="leads__table">
                  <thead>
                    <tr>
                      <th scope="col">Received (IST)</th>
                      <th scope="col">Name</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Email</th>
                      <th scope="col">Company</th>
                      <th scope="col">About</th>
                      <th scope="col">Form</th>
                      <th scope="col">Page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list!.rows.map((r) => (
                      <tr key={r.id}>
                        <td className="leads__nowrap">{ist(r.createdAt)}</td>
                        <td>
                          <Link href={href(query, { id: r.id, page: pageNo > 1 ? pageNo : null })}>{r.name || "(no name)"}</Link>
                        </td>
                        <td className="leads__nowrap">{r.phone}</td>
                        <td>{r.email}</td>
                        <td>{r.company}</td>
                        <td>{r.product}</td>
                        <td>{r.form}</td>
                        <td>{r.page}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 && (
              <nav className="leads__pager" aria-label="Pages">
                {pageNo > 1 ? <Link href={href(query, { page: pageNo - 1 })}>← Newer</Link> : <span />}
                {pageNo < pages ? <Link href={href(query, { page: pageNo + 1 })}>Older →</Link> : <span />}
              </nav>
            )}
          </>
        )}
      </Gutter>
    </DefaultTemplate>
  );
}

// Payload's admin theme variables, so the page follows its light and dark themes.
const CSS = `
.leads { padding-top: 24px; padding-bottom: 48px; }
.leads h1 { margin: 0 0 4px; }
.leads__head { margin-bottom: 20px; }
.leads__muted { color: var(--theme-elevation-500); font-weight: normal; }
.leads__filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; margin-bottom: 12px; }
.leads__filters label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.leads__filters select, .leads__filters input {
  height: 36px; padding: 0 10px; border: 1px solid var(--theme-elevation-150); border-radius: var(--style-radius-s, 4px);
  background: var(--theme-input-bg, var(--theme-elevation-0)); color: var(--theme-text); font: inherit; font-size: 14px;
}
.leads__search input { width: 260px; max-width: 100%; }
.leads__button {
  height: 36px; padding: 0 16px; border: 0; border-radius: var(--style-radius-s, 4px); cursor: pointer;
  background: var(--theme-elevation-800); color: var(--theme-elevation-0); font: inherit; font-size: 14px;
  display: inline-flex; align-items: center; text-decoration: none;
}
.leads__button--secondary { background: var(--theme-elevation-100); color: var(--theme-text); margin-left: auto; }
.leads__scroll { overflow-x: auto; border: 1px solid var(--theme-elevation-100); border-radius: var(--style-radius-m, 6px); }
.leads__table { width: 100%; border-collapse: collapse; font-size: 14px; }
.leads__table th, .leads__table td { padding: 10px 12px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--theme-elevation-100); }
.leads__table th { background: var(--theme-elevation-50); font-weight: 600; white-space: nowrap; }
.leads__table tbody tr:hover { background: var(--theme-elevation-50); }
.leads__nowrap { white-space: nowrap; }
.leads__pager { display: flex; justify-content: space-between; margin-top: 16px; }
.leads__detail { max-width: 860px; }
.leads__detail h2 { margin: 8px 0 4px; }
.leads__detail h3 { margin: 28px 0 8px; }
.leads__contact { display: flex; gap: 20px; flex-wrap: wrap; margin: 0 0 16px; }
.leads__dl { margin: 0; border-top: 1px solid var(--theme-elevation-100); }
.leads__dl > div { display: grid; grid-template-columns: minmax(120px, 220px) 1fr; gap: 16px; padding: 8px 0; border-bottom: 1px solid var(--theme-elevation-100); }
.leads__dl dt { color: var(--theme-elevation-500); overflow-wrap: anywhere; }
.leads__dl dd { margin: 0; overflow-wrap: anywhere; }
.leads__line { display: block; white-space: pre-wrap; }
@media (max-width: 640px) { .leads__dl > div { grid-template-columns: 1fr; gap: 2px; } .leads__button--secondary { margin-left: 0; } }
`;
