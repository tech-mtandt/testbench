import type { FieldDef } from "@/ui/Forms/LeadForm";

const optIn: FieldDef = {
  name: "marketingOptIn",
  type: "checkbox",
  full: true,
  label:
    "Sign up to receive emails from Mtandt Group about products, services, offers, news and events (you can unsubscribe at any time).",
};

/**
 * The one enquiry form, as in the landing pages' popup: name and phone, email optional, so a
 * request takes seconds. Every enquiry uses it (get in touch, contact page, product, service and
 * quote forms, brochure downloads); the product or service and the page it was sent from go
 * along as hidden fields (see useLeadForm).
 */
export const enquiryFields: FieldDef[] = [
  { name: "name", label: "Your Name", required: true },
  { name: "mobile", label: "Phone Number", type: "tel", required: true },
  { name: "email", label: "Email (optional)", type: "email", full: true },
];

export const subscribeFields: FieldDef[] = [
  { name: "firstName", label: "First Name", required: true },
  { name: "lastName", label: "Last Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "companyName", label: "Company Name", required: true },
  { name: "designation", label: "Designation", required: true },
  { name: "location", label: "Location", required: true },
  optIn,
];
