"use client";

import { motion } from "motion/react";

export default function AssistBanner() {
  return (
    <motion.div
      className="bg-primary-yellow"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="default-margin flex flex-col md:flex-row items-center justify-between gap-2 py-4 text-center md:text-left">
        <p className="text-xl md:text-2xl">We are here to assist you.</p>
        <a
          href="tel:+919090101065"
          className="text-xl md:text-2xl font-bold underline underline-offset-4 decoration-2"
        >
          Call us: +91 9090 1010 65
        </a>
      </div>
    </motion.div>
  );
}
