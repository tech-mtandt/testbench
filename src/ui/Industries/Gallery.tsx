"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Img from "@/ui/Img";
import Sheet from "@/ui/kit/Sheet";

/*
 * Grid geometry: 2 columns on mobile, 4 from sm. With 5+ images the first is a 2x2
 * feature tile. The last tile widens to fill any gap so rows always end flush.
 */
const big = (n: number) => n > 4;
const smSpan = (n: number) => {
  const cells = big(n) ? n + 3 : n;
  const rem = cells % 4;
  return rem ? 1 + (4 - rem) : 1;
};
const xsSpan = (n: number) => ((big(n) ? n + 3 : n) % 2 ? 2 : 1);
const SM_SPAN: Record<number, string> = { 1: "", 2: "sm:col-span-2", 3: "sm:col-span-3", 4: "sm:col-span-4" };
const SM_ASPECT: Record<number, string> = { 1: "sm:aspect-square", 2: "sm:aspect-[2/1]", 3: "sm:aspect-[3/1]", 4: "sm:aspect-[4/1]" };

function cellClass(i: number, n: number) {
  if (i === 0 && big(n)) return "col-span-2 row-span-2";
  if (i !== n - 1) return "";
  return `${xsSpan(n) === 2 ? "col-span-2" : ""} ${SM_SPAN[smSpan(n)]} ${xsSpan(n) === 2 && smSpan(n) === 1 ? "sm:col-span-1" : ""}`;
}
function aspectClass(i: number, n: number) {
  if (i === 0 && big(n)) return "aspect-square h-full";
  if (i !== n - 1) return "aspect-square";
  return `${xsSpan(n) === 2 ? "aspect-[2/1]" : "aspect-square"} ${SM_ASPECT[smSpan(n)]}`;
}

export type GalleryImage = { src: string; title?: string };

/** Image grid (first tile large) with a keyboard-navigable lightbox sheet. */
export default function Gallery({ images, label = "Gallery" }: { images: GalleryImage[]; label?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const n = images.length;
  const step = useCallback(
    (d: number) => {
      setDir(d);
      setOpen((i) => (i === null ? i : (i + d + n) % n));
    },
    [n],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, step]);

  if (!n) return null;
  const current = open === null ? null : images[open];
  const showTitle = (t?: string) => t && !/lorem ipsum/i.test(t);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.src + i} className={cellClass(i, n)}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className={`group relative block w-full overflow-hidden rounded-[var(--radius-card)] bg-line text-left ${aspectClass(i, n)}`}
              aria-label={`Open image ${i + 1} of ${n}${showTitle(img.title) ? `: ${img.title}` : ""}`}
            >
              <Img
                src={img.src}
                alt={showTitle(img.title) ? img.title : ""}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20" />
              <span className="glass absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand className="h-4 w-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Sheet
        open={open !== null}
        onClose={() => setOpen(null)}
        side="center"
        width="max-w-5xl"
        title={label}
        description={open !== null ? <span className="font-mono tabular">{`${open + 1} / ${n}`}</span> : undefined}
      >
        {current && (
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-ink sm:aspect-[16/10]">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={open}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Img src={current.src} alt={showTitle(current.title) ? current.title : ""} loading="eager" className="h-full w-full object-contain" />
                </motion.div>
              </AnimatePresence>
              {n > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="glass absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink transition-colors hover:bg-brand"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="glass absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink transition-colors hover:bg-brand"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {n > 1 && (
              <ul className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <li key={img.src + i} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setDir(i > (open ?? 0) ? 1 : -1);
                        setOpen(i);
                      }}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={i === open}
                      className={`block h-16 w-20 overflow-hidden rounded-xl ring-2 transition ${i === open ? "ring-ink" : "opacity-60 ring-transparent hover:opacity-100"}`}
                    >
                      <Img src={img.src} alt="" className="h-full w-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Sheet>
    </>
  );
}
