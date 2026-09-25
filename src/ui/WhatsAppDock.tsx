"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { contact } from "@/content/site";
import { WhatsAppIcon } from "@/ui/Icons";

/** Bottom-right dock: WhatsApp always, back-to-top once scrolled. */
export default function WhatsAppDock() {
  const lenis = useLenis();
  const [far, setFar] = useState(false);
  useEffect(() => {
    const on = () => setFar(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {far && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.2 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
            aria-label="Back to top"
            className="glass flex h-11 w-11 items-center justify-center rounded-full text-ink shadow-[var(--shadow-soft)]"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
      <a
        href={contact.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-whatsapp text-white shadow-[var(--shadow-lift)] transition-transform duration-300 hover:scale-105"
      >
        <WhatsAppIcon className="h-6 w-6" />
      </a>
    </div>
  );
}
