"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type Slide = { image: string | null; eyebrow: string; title: string[] };

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative h-[260px] overflow-hidden bg-ink sm:h-[380px] lg:h-[500px]" aria-roledescription="carousel">
      {slides.map((s, idx) => (
        <div
          key={idx}
          aria-hidden={idx !== i}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
          style={s.image ? { backgroundImage: `url("${s.image}")` } : undefined}
        >
          <div className="default-margin flex h-full flex-col justify-center">
            <div className={`max-w-md transition-all duration-700 ${idx === i ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
              <p className="mb-2 text-sm font-medium text-ink sm:text-base">{s.eyebrow}</p>
              <h2 className="mb-5 text-2xl font-bold leading-tight text-ink sm:text-4xl">
                {s.title.map((line, n) => (
                  <span key={n} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              <Link href="/contact-us" className="btn-dark">
                Enquire now
              </Link>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-10 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
            className={`h-3 w-3 rounded-full border-2 border-white transition-colors ${idx === i ? "bg-white" : "bg-transparent"}`}
          />
        ))}
      </div>
    </section>
  );
}
