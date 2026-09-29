"use client";

import { useEffect } from "react";
import Modal from "@/ui/Modal";
import Img from "@/ui/Img";
import { ChevronLeft, ChevronRight } from "@/ui/Icons";

export type LightboxImage = { src: string; title?: string; caption?: string };

type Props = { images: LightboxImage[]; index: number | null; onChange: (i: number | null) => void };

/** Modal image viewer with prev/next, shared by the product, industry and case-study galleries. */
export default function Lightbox({ images, index, onChange }: Props) {
  const img = index === null ? null : images[index];
  const step = (d: number) => index !== null && onChange((index + d + images.length) % images.length);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onChange((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onChange((index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onChange]);
  return (
    <Modal open={index !== null} onClose={() => onChange(null)} title={img?.title || "Gallery"} wide>
      {img && (
        <figure className="relative">
          <Img src={img.src} alt={img.title ?? ""} loading="eager" className="mx-auto max-h-[65vh] w-auto" />
          {img.caption && <figcaption className="mt-3 text-center text-sm text-ink-soft">{img.caption}</figcaption>}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-0 top-1/2 flex h-11 w-7 -translate-y-1/2 items-center justify-center bg-brand text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-0 top-1/2 flex h-11 w-7 -translate-y-1/2 items-center justify-center bg-brand text-ink"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </figure>
      )}
    </Modal>
  );
}
