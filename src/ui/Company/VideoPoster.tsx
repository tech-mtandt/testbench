"use client";

import { AnimatePresence, motion } from "motion/react";
import { Play } from "lucide-react";
import { useState } from "react";
import Img from "@/ui/Img";

/** Click-to-play YouTube film: a static poster until the user asks, then a lazy iframe. */
export default function VideoPoster({ id, title, caption }: { id: string; title: string; caption?: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-[var(--radius-panel)] bg-graphite">
      <AnimatePresence initial={false}>
        {play ? (
          <motion.iframe
            key="frame"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <motion.button
            key="poster"
            type="button"
            exit={{ opacity: 0 }}
            onClick={() => setPlay(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 block h-full w-full text-left"
          >
            <Img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="eager"
              className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-80 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
            <span className="absolute top-1/2 left-1/2 flex h-18 w-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-ink shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110 sm:h-20 sm:w-20">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand/40 [animation-duration:2.4s]" />
              <Play className="relative ml-1 h-6 w-6 fill-current" />
            </span>
            {caption && (
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                <span>
                  <span className="block font-mono text-[11px] tracking-[0.14em] text-brand uppercase">Watch the film</span>
                  <span className="mt-1 block text-lg font-semibold text-white sm:text-xl">{caption}</span>
                </span>
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
