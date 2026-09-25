"use client";

import { useState } from "react";
import Img from "@/ui/Img";
import Carousel from "@/ui/Carousel";
import Lightbox, { type LightboxImage } from "@/ui/CustomProduct/Lightbox";

type Props = { images: LightboxImage[]; variant?: "grid" | "carousel" };

/** Clickable thumbnails (grid or carousel) that open in the lightbox. */
export default function ImageGrid({ images, variant = "grid" }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const thumbs = images.map((img, i) => (
    <button
      key={`${img.src}-${i}`}
      type="button"
      onClick={() => setOpen(i)}
      aria-label={img.title || "Open image"}
      className={
        variant === "carousel"
          ? "aspect-[10/9] w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
          : "aspect-[9/7] overflow-hidden"
      }
    >
      <Img src={img.src} alt={img.title ?? ""} className="h-full w-full object-cover transition-transform hover:scale-105" />
    </button>
  ));
  return (
    <>
      {variant === "carousel" ? (
        <Carousel>{thumbs}</Carousel>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">{thumbs}</div>
      )}
      <Lightbox images={images} index={open} onChange={setOpen} />
    </>
  );
}
