"use client";

import { useState } from "react";
import Modal from "@/ui/Modal";
import LeadForm from "@/ui/Forms/LeadForm";
import { enquiryFields } from "@/content/forms";

type Props = { product: string; productId?: string | null; kind: "buy" | "rental" };

export default function EnquireButton({ product, productId, kind }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-yellow">
        Enquire Now
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Custom Product Enquiry Form">
        <div className="text-left">
          <p className="mb-4 text-sm font-semibold text-ink">{product}</p>
          <LeadForm
            form="custom-product-enquiry"
            fields={enquiryFields}
            columns={1}
            hidden={{ product, productId: productId ?? "", productType: kind === "rental" ? "rent" : "buy" }}
          />
        </div>
      </Modal>
    </>
  );
}
