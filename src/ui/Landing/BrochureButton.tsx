"use client";

import { useState } from "react";
import DownloadGate from "@/ui/Catalogue/DownloadGate";
import { DownloadIcon } from "@/ui/Icons";
import Modal from "@/ui/Modal";

/** "Download Brochure" button: a short name + phone form, then the PDF link. */
export default function BrochureButton({
  title,
  href,
  page,
  className = "",
}: {
  title: string;
  href: string | null;
  page: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <DownloadIcon className="h-4 w-4" /> Download {title}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Download ${title}`}
      >
        <DownloadGate title={title} href={href} page={page} simple />
      </Modal>
    </>
  );
}
