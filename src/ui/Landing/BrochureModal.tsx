"use client";

import { useState } from "react";
import DownloadGate from "@/ui/Catalogue/DownloadGate";
import { DownloadIcon } from "@/ui/Icons";
import Modal from "@/ui/Modal";

/** The client half of BrochureButton: the button and its download form. */
export default function BrochureModal({
  title,
  catalogue,
  page,
  className = "",
}: {
  title: string;
  /** Catalogue id of the brochure; its PDF link comes back from submitForm. */
  catalogue: string | null;
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
        <DownloadGate title={title} catalogue={catalogue} page={page} />
      </Modal>
    </>
  );
}
