"use client";

import { useState } from "react";
import Modal from "@/ui/Modal";
import Img from "@/ui/Img";
import { ChevronLeft, ChevronRight } from "@/ui/Icons";

export type LightboxItem = { type: "image" | "video"; src: string };

function Slide({ item, eager }: { item: LightboxItem; eager?: boolean }) {
  if (item.type === "video")
    return (
      <iframe
        src={item.src}
        title="Mtandt Group video"
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  return <Img src={item.src} alt="" loading={eager ? "eager" : "lazy"} className="mx-auto max-h-[65vh] w-auto" />;
}

/** Thumbnail grid that opens a modal slider; videos render inline in the grid (as on live). */
export default function Lightbox({
  items,
  gridClassName = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
  thumbClassName = "aspect-[4/3]",
  title = "Gallery",
}: {
  items: LightboxItem[];
  gridClassName?: string;
  thumbClassName?: string;
  title?: string;
}) {
  const [idx, setIdx] = useState<number | null>(null);
  const images = items.filter((i) => i.type === "image");
  const n = images.length;
  const go = (d: number) => setIdx((i) => (i === null ? i : (i + d + n) % n));

  return (
    <>
      <div className={gridClassName}>
        {items.map((it, i) =>
          it.type === "video" ? (
            <div key={i} className={`min-w-0 border border-neutral-200 bg-black p-0.5 ${thumbClassName}`}>
              <iframe
                src={it.src}
                title={`Mtandt Group video ${i + 1}`}
                loading="lazy"
                className="h-full w-full"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(images.indexOf(it))}
              className={`min-w-0 cursor-zoom-in overflow-hidden border border-neutral-200 bg-white p-0.5 ${thumbClassName}`}
              aria-label={`Open image ${images.indexOf(it) + 1} of ${n}`}
            >
              <Img src={it.src} alt="" className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
            </button>
          ),
        )}
      </div>
      <Modal open={idx !== null} onClose={() => setIdx(null)} title={title} wide>
        {idx !== null && images[idx] && (
          <div className="relative">
            <Slide item={images[idx]} eager />
            {n > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-brand p-2 text-ink hover:bg-brand-light"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-brand p-2 text-ink hover:bg-brand-light"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <p className="mt-3 text-center text-xs">
                  {idx + 1} / {n}
                </p>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
