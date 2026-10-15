/**
 * Rules shared by the public forms (browser) and submitForm (server), so both sides accept
 * and reject the same values. Plain values only: imported by client components.
 */

export const CALL_US = "+91 9090 1010 65";
export const DOCS_EMAIL = "marketing@mtandt.com";

/** submitForm's reply when a submission could be neither stored nor emailed. */
export const FAILED = `Something went wrong. Please call us on ${CALL_US} or try again.`;

/** Longest value accepted in one text field. */
export const MAX_TEXT = 5000;
/** Most fields one submission may carry (the longest partner form has ~40). */
export const MAX_FIELDS = 60;
/** Most files one submission may carry. */
export const MAX_FILES = 15;
/** Per-file limit when the field names none (the partner documents' hints say 500 KB). */
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
/** All files together: server actions take a 4 MB body (next.config.mjs), Vercel 4.5 MB. */
export const MAX_TOTAL_BYTES = 4000 * 1024;

export const formatBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

/** "( max. file size 500KB. File Type: …)" -> 512000, or null when the hint names no size. */
export function maxBytesFromHint(hint?: string | null): number | null {
  const m = hint?.match(/(\d+(?:\.\d+)?)\s*(kb|mb)\b/i);
  return m ? Math.round(Number(m[1]) * (m[2].toLowerCase() === "mb" ? 1024 * 1024 : 1024)) : null;
}

export const tooBig = (what: string) =>
  `${what} Please compress or resize it, or email your documents to ${DOCS_EMAIL}.`;

/**
 * Phone numbers: 10–15 digits with an optional leading +; spaces, dashes and brackets are
 * ignored. PHONE_PATTERN is the same rule as an HTML `pattern` for tel inputs.
 */
export const PHONE_PATTERN = String.raw`[\s\-\(\)]*\+?[\s\-\(\)]*(?:\d[\s\-\(\)]*){10,15}`;
export const PHONE_TITLE = "A 10–15 digit phone number, e.g. 98765 43210 or +91 98765 43210";
export const PHONE_MESSAGE = "Please enter a valid phone number (10–15 digits, e.g. +91 98765 43210).";
export const normalizePhone = (v: string) => v.replace(/[\s\-()]/g, "");
export const isPhone = (v: string) => /^\+?\d{10,15}$/.test(normalizePhone(v));

/** Props for every type="tel" input. */
export const phoneInput = { inputMode: "tel", pattern: PHONE_PATTERN, title: PHONE_TITLE } as const;

// The WHATWG rule browsers apply to type="email", so the server accepts exactly what they do.
const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const EMAIL_MESSAGE = "Please enter a valid email address, e.g. name@company.com.";
export const isEmail = (v: string) => v.length <= 254 && EMAIL.test(v);

/** Field names that hold a phone number or an email address, across all the forms. */
export const isPhoneKey = (k: string) => /mobile|phone|landline/i.test(k);
export const isEmailKey = (k: string) => /email/i.test(k);
