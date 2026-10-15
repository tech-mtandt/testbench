"use client";

import Link from "next/link";
import { useState } from "react";
import { useAutoplay } from "@/components/useAutoplay";
import { bgUrl } from "@/lib/img";

export type Slide = { image: string | null; eyebrow: string; title: string[] };

export default function HeroSlider({ slides, button }: { slides: Slide[]; button: { label: string; href: string } }) {
  const [i, setI] = useState(0);
  const autoplay = useAutoplay(() => setI((v) => (v + 1) % slides.length), 6000, slides.length > 1);

  return (
    <section className="relative h-[260px] overflow-hidden bg-ink sm:h-[380px] lg:h-[500px]" aria-roledescription="carousel" {...autoplay}>
      {slides.map((s, idx) => (
        <div
          key={idx}
          inert={idx !== i}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 motion-reduce:transition-none ${idx === i ? "opacity-100" : "opacity-0"}`}
          style={s.image ? { backgroundImage: `url("${bgUrl(s.image)}")` } : undefined}
        >
          <div className="default-margin flex h-full flex-col justify-center">
            <div
              className={`max-w-md transition-all duration-700 motion-reduce:transition-none ${idx === i ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              <p className="mb-2 text-sm font-medium text-ink sm:text-base">{s.eyebrow}</p>
              <h2 className="mb-5 text-2xl font-bold leading-tight text-ink sm:text-4xl">
                {s.title.map((line, n) => (
                  <span key={n} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              <Link href={button.href} className="btn-dark">
                {button.label}
              </Link>
            </div>
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-8 flex justify-center">
          {slides.map((_, idx) => (
            // 24px hit area around the 12px dot
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === i}
              onClick={() => setI(idx)}
              className="rounded-full p-1.5"
            >
              <span className={`block h-3 w-3 rounded-full border-2 border-white transition-colors ${idx === i ? "bg-white" : "bg-transparent"}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
