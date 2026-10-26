import { enquiryFields } from "@/content/forms";
import LeadForm from "@/ui/Forms/LeadForm";

export default function InquiryForm({ service }: { service: string }) {
  return (
    <div className="default-margin py-10">
      <div className="rounded-md border border-[#e7e7e7] bg-white p-5 md:p-8">
        <h2 className="mb-6 text-center text-2xl font-semibold text-ink">Service Inquiry Form</h2>
        <LeadForm
          form="service-enquiry"
          fields={enquiryFields}
          columns={1}
          hidden={{ service }}
          className="[&_button[type=submit]]:w-full [&_label]:!col-span-full"
        />
      </div>
    </div>
  );
}
