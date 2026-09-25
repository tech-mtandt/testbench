/** Pure view-model helpers for the company pages (about, careers, legal, investor relations). */

export const stripTags = (html: string) =>
  html
    .replace(/<br\s*\/?>|<\/(p|li|h\d|div|ul|ol)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function youTubeId(url?: string | null) {
  return url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1] ?? null;
}

/** "SALES" → "Sales", "PAYMENT TERMS" → "Payment terms" (only when the source is all-caps). */
export function sentenceCase(s: string) {
  if (s !== s.toUpperCase()) return s;
  const l = s.toLowerCase();
  return l.charAt(0).toUpperCase() + l.slice(1);
}

/* ------------------------------------------------------------------ about */

/** Scraped copy has a few words split by stray spaces, and one lorem-style placeholder. */
const typos: [RegExp, string][] = [
  [/Contrac tor/g, "Contractor"],
  [/Star ted/g, "Started"],
  [/pr oviding/g, "providing"],
  [/Estabilished/g, "Established"],
  [/Ac cess/g, "Access"],
  [/P rotection/g, "Protection"],
  [/S ystem/g, "System"],
];
export const cleanCopy = (s: string) => typos.reduce((t, [re, v]) => t.replace(re, v), s).trim();
export const isPlaceholder = (s: string) => /born extremily young|regarded as a mistake/i.test(s);

/** "Financial Strength & Market Leadership: Mtandt is…" → { title, text } */
export function splitPoint(p: string) {
  const i = p.indexOf(":");
  return i > 0 && i < 80 ? { title: p.slice(0, i).trim(), text: p.slice(i + 1).trim() } : { title: "", text: p };
}

/** Business unit suffix in a designation, e.g. "CEO - MRL" → "MRL". */
export function unitOf(designation?: string | null) {
  const m = designation?.match(/\b(MRL|MLIT|MRO)\b|Mtandt Group/);
  return m?.[0] ?? null;
}

/* ------------------------------------------------------------------ investor relations */

export type IrDoc = { label: string; href: string; year: string | null; type: string; code: string | null };

/**
 * Derive year / document type from the label and, because a few live labels are duplicated
 * (two "Annual Return 2024-25" links pointing at a CSR report and an annual report), the file name.
 */
export function irDoc(d: { label: string; href: string }, group: string): IrDoc {
  const file = decodeURIComponent(d.href.split("/").pop() ?? "");
  const year = (d.label.match(/(20\d{2})\s*-\s*(\d{2,4})/) ?? file.match(/(20\d{2})[-_](\d{2,4})/))?.slice(1, 3);
  const yr = year ? `${year[0]}–${year[1].slice(-2)}` : null;
  const code = d.label.match(/\((MGT-7[^)]*)\)/)?.[1] ?? null;
  let type = group;
  let label = d.label.replace(/Deatils/g, "Details");
  if (/csr project/i.test(file)) {
    type = "CSR";
    label = "CSR project details";
  } else if (/annual report/i.test(file)) {
    type = "Annual report";
    label = "Annual report";
  } else if (/csr/i.test(label)) type = "CSR";
  else if (/MGT/i.test(file) || /MGT/.test(label)) {
    type = "Form MGT-7";
    label = `Annual return${code ? ` (${code})` : ""}`;
  }
  if (type === "CSR" && yr) label = label.replace(/[\s_-]*20\d{2}-\d{2,4}$/, "");
  return { label, href: d.href, year: yr, type, code };
}

/* ------------------------------------------------------------------ careers */

const deptRules: [RegExp, string][] = [
  [/account|finance/i, "Accounting"],
  [/marketing|hubspot/i, "Marketing"],
  [/sales|customer service/i, "Sales"],
  [/hr|human/i, "Human Resource"],
  [/manufactur|production/i, "Manufacturing"],
];

export type JobMeta = { department: string; location: string | null; experience: string | null };

export function jobMeta(title: string, html: string): JobMeta {
  const text = stripTags(html);
  const loc = text.match(/Location\s*:\s*([A-Za-z ,]+?)(?=\s+(?:Company|Reach|We are|Job)\b|$)/)?.[1]?.trim() ?? (/Noida/.test(text) ? "Noida" : null);
  const exp =
    text.match(/(\d+\s*-\s*\d+)\s*years/i)?.[1]?.replace(/\s/g, "") ??
    text.match(/(\d+)\+\s*years/i)?.[1]?.concat("+") ??
    text.match(/(\d+)\s*years/i)?.[1]?.concat("+") ??
    (/minimum one year/i.test(text) ? "1+" : null);
  const dept = deptRules.find(([re]) => re.test(title))?.[1] ?? "Others";
  return { department: dept, location: loc, experience: exp ? `${exp.replace("-", "–")} yrs` : null };
}

/* ------------------------------------------------------------------ legal */

export type TocItem = { id: string; label: string; sub?: boolean };

/** Normalise legacy legal HTML: headings → <h2 id>, drop empty nodes, collect a TOC. */
export function legalDoc(html: string) {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const numbered = /<h[2-6][^>]*>\s*(<[^>]+>\s*)*\d+\s*\./.test(html);
  let body = html
    .replace(/datedJune/g, "dated June")
    .replace(/<h[2-6][^>]*>\s*<\/h[2-6]>/g, "")
    .replace(/<ol>\s*<\/ol>|<ul>\s*<\/ul>|<p>\s*(<br\s*\/?>)?\s*<\/p>/g, "")
    .replace(/<h([2-6])[^>]*>([\s\S]*?)<\/h\1>/g, (_m, _l, inner: string) => {
      const raw = stripTags(inner).replace(/^(\d+)\s*\.\s*/, "$1. ");
      if (!raw) return "";
      const label = sentenceCase(raw);
      let id = slugify(label.replace(/^\d+\.\s*/, "")) || "section";
      while (used.has(id)) id += "-2";
      used.add(id);
      const sub = numbered && !/^\d/.test(label);
      toc.push({ id, label, sub });
      return sub ? `<h3 id="${id}">${label}</h3>` : `<h2 id="${id}">${label}</h2>`;
    });
  body = body.replace(/(<br\s*\/?>\s*){2,}/g, "<br/>");
  const approved = stripTags(html).match(/dated\s*([A-Z][a-z]+ \d{1,2}, \d{4})/)?.[1] ?? null;
  const words = stripTags(body).split(" ").length;
  return { body, toc, approved, minutes: Math.max(1, Math.round(words / 230)) };
}
