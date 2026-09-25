"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useCallback, useEffect, useState, ViewTransition, type KeyboardEvent } from "react";
import Img from "@/ui/Img";
import Sheet from "@/ui/kit/Sheet";

export type GalleryImage = { src: string; alt?: string; caption?: string };

/** Full-screen image viewer with prev/next, counter and keyboard arrows. */
export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  photo,
  title,
}: {
  images: GalleryImage[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  photo?: boolean;
  title: string;
}) {
  const n = images.length;
  const go = useCallback((d: number) => index !== null && onIndex((index + d + n) % n), [index, n, onIndex]);
  useEffect(() => {
    if (index === null) return;
    const on = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [index, go]);
  const cur = index !== null ? images[index] : null;
  return (
    <Sheet
      open={index !== null}
      onClose={onClose}
      side="center"
      width="max-w-6xl"
      title={cur?.caption ? cur.alt || title : title}
      description={
        <span className="font-mono tabular">
          {(index ?? 0) + 1} / {n}
          {cur?.caption ? ` · ${cur.caption}` : ""}
        </span>
      }
    >
      <div className="relative">
        <div className={`relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] sm:aspect-[16/10] ${photo ? "bg-ink" : "bg-white"}`}>
          <AnimatePresence initial={false} mode="popLayout">
            {cur && (
              <motion.div
                key={cur.src}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Img src={cur.src} alt={cur.alt ?? title} loading="eager" className={`h-full w-full object-contain ${photo ? "" : "p-6 mix-blend-multiply"}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="glass absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="glass absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {images.map((im, i) => (
            <button
              key={im.src}
              type="button"
              onClick={() => onIndex(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === index}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-colors ${i === index ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <Img src={im.src} alt="" className={`absolute inset-0 h-full w-full ${photo ? "object-cover" : "object-contain p-1 mix-blend-multiply"}`} />
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}

/** Product hero gallery: stage + thumbnails, arrow keys, lightbox. The stage carries the shared-element name. */
export default function Gallery({ images, title, slug, photo }: { images: string[]; title: string; slug: string; photo?: boolean }) {
  const [i, setIndex] = useState(0);
  const [moved, setMoved] = useState(false);
  const setI = (f: (x: number) => number) => {
    setMoved(true);
    setIndex(f);
  };
  const [zoom, setZoom] = useState<number | null>(null);
  const n = images.length;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") setI((x) => (x + 1) % n);
    if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setZoom(i);
    }
  };
  const list = images.map((src, k) => ({ src, alt: `${title} — image ${k + 1}` }));
  return (
    <div className="min-w-0">
      <div className={`group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] border border-line ${photo ? "bg-line" : "bg-white"}`}>
        <ViewTransition name={`product-${slug}`} share="morph">
          <Img
            key={images[i]}
            src={images[i]}
            alt={title}
            loading="eager"
            fetchPriority="high"
            className={`absolute inset-0 h-full w-full ${moved ? "animate-fade-up" : ""} transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] ${
              photo ? "object-cover" : "object-contain p-8 mix-blend-multiply sm:p-12"
            }`}
          />
        </ViewTransition>
        <button
          type="button"
          aria-label={`Open image ${i + 1} of ${n} full screen. Arrow keys browse.`}
          onKeyDown={onKey}
          onClick={() => n && setZoom(i)}
          className="peer absolute inset-0 cursor-zoom-in rounded-[var(--radius-panel)] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink"
        />
        <span className="glass pointer-events-none absolute right-4 bottom-4 flex h-10 items-center gap-2 rounded-full px-3.5 text-[12px] font-medium text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 peer-focus-visible:opacity-100 max-sm:opacity-100">
          <Expand className="h-3.5 w-3.5" />
          {n > 1 ? <span className="font-mono tabular">{i + 1}/{n}</span> : "Zoom"}
        </span>
        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setI((x) => (x - 1 + n) % n);
              }}
              className="glass absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setI((x) => (x + 1) % n);
              }}
              className="glass absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((src, k) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={`Show image ${k + 1}`}
              onClick={() => setI(() => k)}
              className={`relative h-[72px] w-[88px] shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 ${photo ? "bg-line" : "bg-white"} ${
                k === i ? "border-ink" : "border-line hover:border-line-strong"
              }`}
            >
              <Img src={src} alt="" className={`absolute inset-0 h-full w-full ${photo ? "object-cover" : "object-contain p-1.5 mix-blend-multiply"}`} />
            </button>
          ))}
        </div>
      )}
      <Lightbox images={list} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} photo={photo} title={title} />
    </div>
  );
}
