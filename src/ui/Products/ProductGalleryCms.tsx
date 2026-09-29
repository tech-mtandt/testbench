"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryImage = {
  url: string;
  alt: string;
};

export default function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (!active) {
    return <div className="aspect-square w-full bg-black/5" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {images.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden border bg-white ${
                index === activeIndex ? "border-primary-yellow" : "border-black/10"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-contain"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square w-full bg-white">
        <Image
          src={active.url}
          alt={active.alt}
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 40vw, 100vw"
          priority
        />
      </div>
    </div>
  );
}
