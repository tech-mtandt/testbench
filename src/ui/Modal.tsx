"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/ui/Icons";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  wide?: boolean;
};

/** Native <dialog> wrapper: focus trapping, Esc and backdrop close come for free. */
export default function Modal({ open, onClose, title, children, wide }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-3xl" : "max-w-lg"} bg-white p-0 shadow-2xl backdrop:bg-black/60`}
    >
      <div className="flex items-center justify-between border-b-4 border-brand bg-ink px-5 py-3">
        <h3 className="text-lg text-white">{title}</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="text-white hover:text-brand">
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
    </dialog>
  );
}
