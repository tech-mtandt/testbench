"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Slide-over panel (right on desktop, bottom sheet on mobile). Esc / backdrop close,
 * locks page scroll while open. Use for quote forms, filters, lightboxes.
 */
export default function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  side = "right",
  width = "max-w-xl",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  side?: "right" | "center";
  width?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;
  const center = side === "center";
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" data-lenis-prevent>
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`absolute flex flex-col overflow-hidden bg-canvas shadow-2xl ${
              center
                ? `inset-x-3 top-1/2 mx-auto max-h-[90dvh] rounded-[var(--radius-panel)] ${width}`
                : `inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[var(--radius-panel)] sm:inset-y-3 sm:right-3 sm:left-auto sm:max-h-none sm:w-full sm:rounded-[var(--radius-panel)] ${width}`
            }`}
            initial={center ? { opacity: 0, scale: 0.96, y: "-46%" } : { opacity: 0, y: 40, x: 0 }}
            animate={center ? { opacity: 1, scale: 1, y: "-50%" } : { opacity: 1, y: 0 }}
            exit={center ? { opacity: 0, scale: 0.97, y: "-48%" } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink transition-colors hover:bg-ink hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
