"use server";

import configPromise from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { getCatalogues } from "@/content/catalogues";
import {
  CALL_US,
  EMAIL_MESSAGE,
  FAILED,
  MAX_FIELDS,
  MAX_FILES,
  MAX_TEXT,
  MAX_TOTAL_BYTES,
  PHONE_MESSAGE,
  formatBytes,
  isEmail,
  isEmailKey,
  isPhone,
  isPhoneKey,
  normalizePhone,
  tooBig,
} from "@/lib/form-rules";
import { leadContact, recentLeads, saveLead, type Db, type LeadFile } from "@/lib/leads";

export type FormState = {
  ok: boolean;
  message: string;
  /** The field the message is about, so the form can focus it. */
  field?: string;
  /** Gated download (catalogue/brochure PDF): only sent once the lead is stored. */
  download?: string | null;
} | null;

/** Forms that take uploads (CVs, partner documents); files sent to any other form are refused. */
const FILE_FORMS = new Set(["career", "customers", "dealer", "vendors"]);

/** At most RATE_LIMIT stored submissions per IP address per RATE_WINDOW minutes. */
const RATE_LIMIT = 5;
const RATE_WINDOW = 10;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const fail = (message: string, field?: string): FormState => ({ ok: false, message, ...(field ? { field } : {}) });

/**
 * Single sink for every public form (enquiry, contact, subscribe, career, partner, landing
 * popup, brochure downloads…). Each submission is validated, rate limited per IP, stored in
 * the `website_leads` table in Supabase with any files (see lib/leads) and, when Resend and
 * FORMS_TO_EMAIL are configured, emailed. It only reports success once one of those worked.
 */
export async function submitForm(_prev: FormState, formData: FormData): Promise<FormState> {
  const form = String(formData.get("_form") || "enquiry");
  if (!/^[\w-]{1,40}$/.test(form)) return fail(FAILED);
  if (formData.get("_hp")) return { ok: true, message: "Thank you!" }; // honeypot

  const fields: [string, string][] = [];
  const uploads: { index: number; field: string; file: File }[] = [];
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("_") || k.startsWith("$") || k.length > 100) continue;
    if (typeof v === "string") fields.push([k, v.trim()]);
    else if (v.size) {
      uploads.push({ index: fields.length, field: k, file: v });
      fields.push([k, `[file] ${v.name} (${Math.round(v.size / 1024)} KB)`]);
    }
  }

  if (fields.length > MAX_FIELDS) return fail(FAILED);
  for (const f of fields) {
    const [k, v] = f;
    if (v.length > MAX_TEXT) {
      return fail(`Please shorten this to ${MAX_TEXT.toLocaleString("en-IN")} characters or fewer.`, k);
    }
    if (!v) continue;
    if (isPhoneKey(k)) {
      if (!isPhone(v)) return fail(PHONE_MESSAGE, k);
      f[1] = normalizePhone(v);
    } else if (isEmailKey(k) && !isEmail(v)) {
      return fail(EMAIL_MESSAGE, k);
    }
  }
  const who = leadContact(fields);
  if (!who.name) {
    const keys = fields.map(([k]) => k);
    return fail("Please enter your name.", ["name", "fullName", "firstName"].find((k) => keys.includes(k)));
  }
  if (!who.phone && !who.email) {
    return fail(
      "Please enter a phone number or email address so we can reach you.",
      fields.find(([k]) => isPhoneKey(k) || isEmailKey(k))?.[0],
    );
  }

  if (uploads.length) {
    if (!FILE_FORMS.has(form)) return fail("This form does not take attachments.");
    if (uploads.length > MAX_FILES) return fail(tooBig(`Please attach at most ${MAX_FILES} files.`));
    const total = uploads.reduce((n, u) => n + u.file.size, 0);
    if (total > MAX_TOTAL_BYTES) {
      return fail(tooBig(`Your files add up to ${formatBytes(total)}; the limit is about 4 MB in total.`), uploads[0].field);
    }
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "").trim().slice(0, 64) || null;
  const payload = await getPayload({ config: configPromise }).catch((err) => {
    console.error("[forms] payload init failed", err);
    return null;
  });
  const pool = payload && (payload.db as unknown as { pool: Db }).pool;

  if (pool && ip) {
    try {
      if ((await recentLeads(pool, ip, RATE_WINDOW)) >= RATE_LIMIT) {
        return fail(`Too many requests from your network. Please call us on ${CALL_US}, or try again in a few minutes.`);
      }
    } catch (err) {
      console.error("[forms] rate limit check failed", err); // let it through
    }
  }

  // Catalogue/brochure gates send the catalogue id; its PDF link never leaves the server
  // until the lead is in.
  const catalogueId = String(formData.get("_catalogue") || "");
  let download: string | null = null;
  if (catalogueId) {
    const doc = (await getCatalogues().catch(() => [])).find((c) => String(c.id) === catalogueId);
    download = doc?.documentUrl ?? null;
    if (doc) fields.push(["filelink", download ?? ""]);
  }

  let saved: [string, string][] | null = null;
  if (pool) {
    try {
      const files: LeadFile[] = await Promise.all(
        uploads.map(async (u) => ({
          index: u.index,
          field: u.field,
          filename: u.file.name.replace(/[\\/\x00-\x1f]/g, "_").slice(-200) || "file",
          contentType: u.file.type,
          data: new Uint8Array(await u.file.arrayBuffer()),
        })),
      );
      saved = (await saveLead(pool, { form, fields, files, referrer: h.get("referer"), ip })).fields;
    } catch (err) {
      console.error("[forms] saving lead failed", err);
    }
  }

  const page = fields.find(([k]) => k === "page")?.[1];
  const to = process.env.FORMS_TO_EMAIL;
  let emailed = false;
  if (payload && process.env.RESEND_API_KEY && to) {
    // Stored files get a download link (admin login); unstored ones are only named.
    const value = (v: string) =>
      escape(v).replace(/ (\/api\/lead-files\/\d+)$/, (_, path) => ` <a href="${SITE_URL}${path}">download</a>`);
    try {
      await payload.sendEmail({
        to,
        subject: `[mtandt.com] New ${form} submission${page ? ` from /${page.replace(/^\//, "")}` : ""}`,
        html: `<h2>${escape(form)}</h2><table>${(saved ?? fields)
          .map(([k, v]) => `<tr><td><b>${escape(k)}</b></td><td>${value(v)}</td></tr>`)
          .join("")}</table>${saved || !uploads.length ? "" : "<p>The attached files could not be stored: ask the sender to email them.</p>"}`,
      });
      emailed = true;
    } catch (err) {
      console.error("[forms] email failed", err);
    }
  }

  if (!saved && !emailed) {
    // Last resort: the submission is in the server log, so it is not lost.
    console.info(`[forms] unsaved ${form}`, Object.fromEntries(fields));
    return fail(FAILED);
  }

  return { ok: true, message: "Thank you! Our team will get in touch with you shortly.", download };
}
