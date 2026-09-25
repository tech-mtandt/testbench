"use server";

import configPromise from "@payload-config";
import { getPayload } from "payload";

export type FormState = { ok: boolean; message: string } | null;

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Single sink for every public form (enquiry, contact, subscribe, career, partner…).
 *
 * TODO(decision): the legacy site stored these in MySQL (getintouchs, productenquiry,
 * partnerenquiry, …) and pushed to HubSpot/CentraHub. Until a Leads collection or CRM
 * hook exists, submissions are emailed via Resend when configured, else logged.
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

  const to = process.env.FORMS_TO_EMAIL;
  if (process.env.RESEND_API_KEY && to) {
    try {
      const payload = await getPayload({ config: configPromise });
      await payload.sendEmail({
        to,
        subject: `[mtandt.com] New ${form} submission`,
        html: `<h2>${escape(form)}</h2><table>${fields
          .map(([k, v]) => `<tr><td><b>${escape(k)}</b></td><td>${escape(v)}</td></tr>`)
          .join("")}</table>`,
      });
    } catch (err) {
      console.error("[forms] email failed", err);
      return { ok: false, message: "Something went wrong. Please call us or try again." };
    }
  } else {
    console.info(`[forms] ${form}`, Object.fromEntries(fields));
  }

  return { ok: true, message: "Thank you! Our team will get in touch with you shortly." };
}
