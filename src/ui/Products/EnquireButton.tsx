"use client";

import { useState } from "react";
import Modal from "@/ui/Modal";
import LeadForm from "@/ui/Forms/LeadForm";
import { productEnquiryFields } from "@/content/forms";

export default function EnquireButton({ product, slug, mode }: { product: string; slug: string; mode: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-yellow text-xs">
        Enquire Now
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Product Enquiry Form" wide>
        <p className="mb-4 text-sm text-ink-soft">
          Product: <strong className="text-ink">{product}</strong>
        </p>
        <LeadForm
          form="productEnquiry"
          fields={productEnquiryFields}
          hidden={{ product, productSlug: slug, productType: mode }}
        />
      </Modal>
    </>
  );
}
