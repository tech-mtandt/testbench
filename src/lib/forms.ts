"use server";

import configPromise from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { saveLead, type Db } from "@/lib/leads";

export type FormState = { ok: boolean; message: string } | null;

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Single sink for every public form (enquiry, contact, subscribe, career, partner, landing
 * popup, brochure downloads…). Each submission is stored in the `website_leads` table in
 * Supabase (see lib/leads) and, when Resend and FORMS_TO_EMAIL are configured, emailed.
 */
export async function submitForm(_prev: FormState, formData: FormData): Promise<FormState> {
  const form = String(formData.get("_form") || "enquiry");
  if (formData.get("_hp")) return { ok: true, message: "Thank you!" }; // honeypot

  const fields: [string, string][] = [];
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("_") || k.startsWith("$ACTION")) continue;
    if (typeof v === "string") fields.push([k, v.trim()]);
    else if (v.size) fields.push([k, `[file] ${v.name} (${Math.round(v.size / 1024)} KB)`]);
  }
  const email = fields.find(([k]) => k === "email")?.[1];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const payload = await getPayload({ config: configPromise }).catch((err) => {
    console.error("[forms] payload init failed", err);
    return null;
  });

  let saved = false;
  if (payload) {
    try {
      await saveLead((payload.db as unknown as { pool: Db }).pool, {
        form,
        fields,
        referrer: (await headers()).get("referer"),
      });
      saved = true;
    } catch (err) {
      console.error("[forms] saving lead failed", err);
    }
  }

  const page = fields.find(([k]) => k === "page")?.[1];
  const to = process.env.FORMS_TO_EMAIL;
  let emailed = false;
  if (payload && process.env.RESEND_API_KEY && to) {
    try {
      await payload.sendEmail({
        to,
        subject: `[mtandt.com] New ${form} submission${page ? ` from /${page.replace(/^\//, "")}` : ""}`,
        html: `<h2>${escape(form)}</h2><table>${fields
          .map(([k, v]) => `<tr><td><b>${escape(k)}</b></td><td>${escape(v)}</td></tr>`)
          .join("")}</table>`,
      });
      emailed = true;
    } catch (err) {
      console.error("[forms] email failed", err);
    }
  }

  if (!saved && !emailed) {
    // Last resort: the submission is in the server log, so it is not lost.
    console.info(`[forms] unsaved ${form}`, Object.fromEntries(fields));
    if (to) return { ok: false, message: "Something went wrong. Please call us or try again." };
  }

  return { ok: true, message: "Thank you! Our team will get in touch with you shortly." };
}
