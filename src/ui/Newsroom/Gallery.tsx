"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Img from "@/ui/Img";
import Sheet from "@/ui/kit/Sheet";

export type GalleryEntry = { type: "image" | "video"; src: string };

const ytId = (src: string) => src.match(/(?:embed\/|youtu\.be\/|v=)([\w-]{11})/)?.[1] ?? null;
const ytList = (src: string) => src.match(/[?&]list=([\w-]+)/)?.[1] ?? null;
const ytThumb = (src: string) => {
  const id = ytId(src);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};
const ytEmbed = (src: string) => {
  const id = ytId(src);
  const list = ytList(src);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1${list ? `&list=${list}` : ""}` : src;
};

// varied crops give square source photos a masonry rhythm without layout shift
const shapes = ["aspect-square", "aspect-[4/5]", "aspect-square", "aspect-[4/3]", "aspect-[4/5]", "aspect-square"];

/**
 * Masonry-style media grid; click opens a centred Sheet lightbox with prev/next,
 * ←/→ keys and a counter. Videos play inline in the lightbox via youtube-nocookie.
 */
export default function Gallery({
  items,
  title = "Gallery",
  columns = "columns-2 md:columns-3 lg:columns-4",
  uniform,
}: {
  items: GalleryEntry[];
  title?: string;
  columns?: string;
  uniform?: boolean;
}) {
  const [idx, setIdx] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const n = items.length;
  const go = useCallback(
    (d: number) => {
      setDir(d);
      setIdx((i) => (i === null ? i : (i + d + n) % n));
    },
    [n],
  );

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [idx, go]);

  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (idx === null) return;
    const el = strip.current?.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [idx]);

  const current = idx !== null ? items[idx] : null;
  let imageNo = 0;
  let videoNo = 0;

  return (
    <>
      <ul className={`${columns} gap-3 sm:gap-4`}>
        {items.map((it, i) => {
          const video = it.type === "video";
          const label = video ? `Play video ${++videoNo}` : `Open photo ${++imageNo}`;
          const thumb = video ? ytThumb(it.src) : it.src;
          return (
            <li key={`${it.src}-${i}`} className="mb-3 break-inside-avoid sm:mb-4">
              <button
                type="button"
                onClick={() => {
                  setDir(1);
                  setIdx(i);
                }}
                aria-label={label}
                className={`group relative block w-full overflow-hidden rounded-[var(--radius-card)] bg-line ${
                  video ? "aspect-video bg-graphite" : uniform ? "aspect-[4/3]" : shapes[i % shapes.length]
                }`}
              >
                {thumb && (
                  <Img
                    src={thumb}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105 ${video ? "opacity-80" : ""}`}
                  />
                )}
                {video ? (
                  <>
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                    <span className="absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-ink shadow-lg transition-transform duration-500 group-hover:scale-110">
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </span>
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur">
                      Video
                    </span>
                  </>
                ) : (
                  <span className="glass absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Expand className="h-4 w-4" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <Sheet
        open={idx !== null}
        onClose={() => setIdx(null)}
        side="center"
        width="max-w-5xl"
        title={title}
        description={idx !== null ? `${current?.type === "video" ? "Video" : "Photo"} ${idx + 1} of ${n}` : undefined}
      >
        {current && idx !== null && (
          <div className="relative">
            <div className="relative flex min-h-[40vh] items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-graphite">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={idx}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex w-full items-center justify-center"
                >
                  {current.type === "video" ? (
                    <iframe
                      src={ytEmbed(current.src)}
                      title={`${title} — video`}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <Img src={current.src} alt={`${title} — photo ${idx + 1}`} loading="eager" className="max-h-[68dvh] w-auto max-w-full object-contain" />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {n > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div ref={strip} className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-1">
                  {items.map((it, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to item ${i + 1}`}
                      aria-current={i === idx}
                      onClick={() => {
                        setDir(i > idx ? 1 : -1);
                        setIdx(i);
                      }}
                      className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-line transition-[opacity,box-shadow] ${
                        i === idx ? "opacity-100 ring-2 ring-ink ring-offset-2 ring-offset-canvas" : "opacity-50 hover:opacity-100"
                      }`}
                    >
                      <Img src={(it.type === "video" ? ytThumb(it.src) : it.src) ?? undefined} alt="" className="h-full w-full object-cover" />
                      {it.type === "video" && <Play className="absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 fill-white text-white" />}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-ink transition-colors hover:bg-brand-600"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </>
  );
}
