"use client";

import { useState } from "react";
import Img from "@/ui/Img";

export default function ProductGallery({ main, images, alt }: { main: string | null; images: string[]; alt: string }) {
  const [current, setCurrent] = useState(main ?? images[0] ?? null);
  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto sm:max-h-[360px] sm:flex-col sm:overflow-y-auto">
          {images.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setCurrent(src)}
              className={`h-16 w-16 shrink-0 border bg-white p-1 ${current === src ? "border-ink" : "border-neutral-300"}`}
              aria-label="Show image"
            >
              <Img src={src} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
      <div className="flex aspect-square w-full max-w-[360px] items-center justify-center bg-surface p-2">
        <Img src={current ?? undefined} alt={alt} loading="eager" className="max-h-full max-w-full object-contain" />
      </div>
    </div>
  );
}
