import type { FieldDef } from "@/ui/Forms/LeadForm";

/** Field sets mirrored from the live site's forms (names normalised). */

export const productInterestOptions = [
  "Boom Lift",
  "Scissor Lift",
  "Vertical Lift",
  "Spider Lift",
  "Truck Mounted Boom Lift",
  "Boom Lift for Road and Rail",
  "Material Handling Equipment (Order Picker, Duct Lifter)",
  "Spider Boom Crane",
  "Mobile Light Tower & Power Station",
  "Aluminium Scaffolding",
  "Lifting & Access Equipment (Tower Crane, Hoists, Mast Climber)",
  "Temporary Road Mats",
  "Fall Protection Lifeline System",
  "Suspended Under Deck Access System",
  "Adjustable Access System (FastBeam)",
  "Industrial Rope Access",
  "Total Asset Management",
  "Tools, PPEs, & Supplies",
  "Training & Certification",
];

const optIn: FieldDef = {
  name: "marketingOptIn",
  type: "checkbox",
  full: true,
  label:
    "Sign up to receive emails from Mtandt Group about products, services, offers, news and events (you can unsubscribe at any time).",
};

export const enquiryFields: FieldDef[] = [
  { name: "name", label: "Full Name", required: true },
  { name: "companyName", label: "Company Name", required: true },
  { name: "designation", label: "Your Designation", required: true },
  { name: "email", label: "Your Email", type: "email", required: true },
  { name: "mobile", label: "Mobile Number", type: "tel", required: true },
  { name: "location", label: "Location", required: true },
  { name: "product", label: "Choose a Product", type: "select", required: true, options: productInterestOptions },
  { name: "lookingTo", label: "Choose type", type: "select", required: true, options: ["Buy", "Rent", "Other"] },
  { name: "message", label: "Message", type: "textarea", required: true },
  optIn,
];

export const contactFields: FieldDef[] = [
  { name: "name", label: "Full Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "companyName", label: "Company Name", required: true },
  { name: "designation", label: "Designation", required: true },
  { name: "mobile", label: "Mobile Number", type: "tel", required: true },
  { name: "location", label: "Location", required: true },
  { name: "product", label: "Choose A Product", type: "select", options: productInterestOptions },
  { name: "lookingTo", label: "Looking To", type: "select", options: ["Buy", "Rent", "Other"] },
  { name: "message", label: "Message", type: "textarea" },
  optIn,
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

export const productEnquiryFields: FieldDef[] = [
  { name: "name", label: "Full Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "mobile", label: "Mobile Number", type: "tel", required: true },
  { name: "companyName", label: "Company Name", required: true },
  { name: "location", label: "Location", required: true },
  { name: "lookingTo", label: "Looking To", type: "select", required: true, options: ["Buy", "Rent", "Other"] },
  { name: "message", label: "Message", type: "textarea" },
];
