import LeadForm, { type FieldDef } from "@/ui/Forms/LeadForm";

/** Mirrors the live "service-Inner-Get-In_touch_form" field set. */
export const serviceInquiryFields: FieldDef[] = [
  { name: "name", label: "Enter Your Full Name", required: true },
  { name: "companyName", label: "Enter Your Company Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "mobile", label: "Mobile Number", type: "tel", required: true },
  { name: "designation", label: "Enter Your Designation" },
  { name: "location", label: "Enter Your Location", required: true },
  { name: "inquiryFor", label: "Inquiry For" },
  { name: "message", label: "Message", type: "textarea" },
];

export default function InquiryForm({ service }: { service: string }) {
  return (
    <div className="default-margin py-10">
      <div className="border border-[#e7e7e7] bg-white p-5 md:p-8">
        <h2 className="mb-6 text-center text-2xl font-semibold text-ink">Service Inquiry Form</h2>
        <LeadForm
          form="service-enquiry"
          fields={serviceInquiryFields}
          columns={1}
          hidden={{ service, page: "Service" }}
          className="[&_button[type=submit]]:w-full [&_label]:!col-span-full"
        />
      </div>
    </div>
  );
}
