/**
 * Forms that count as sales leads (GA4 `generate_lead`, and "Sales leads" in the admin Leads page).
 * Career, partner (dealer, vendor, credit application), feedback and newsletter forms are stored
 * the same way but are not leads. Plain values only: imported by client components.
 */
export const LEAD_FORMS: ReadonlySet<string> = new Set([
  "enquiry",
  "productEnquiry",
  "custom-product-enquiry",
  "service-enquiry",
  "get-in-touch",
  "contact",
  "landing-popup",
  "catalogue-download",
]);
