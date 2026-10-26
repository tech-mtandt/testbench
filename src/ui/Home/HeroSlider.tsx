"use client";

import Link from "next/link";
import { type CSSProperties, useState } from "react";
import { useAutoplay } from "@/components/useAutoplay";
import type { Slide } from "@/content/home";
import { bgUrl } from "@/lib/img";

export type { Slide };

/**
 * Homepage banner. A slide's background is its image, or a muted looping video when one is set
 * in the admin (Pages > Homepage > Hero), with a portrait cut for phones. With any video, the
 * banner takes the video's shape (from its image's size) so the whole frame shows, as on the
 * landing pages; only the slide on screen loads its video.
 */
export default function HeroSlider({ slides, button }: { slides: Slide[]; button: { label: string; href: string } }) {
  const [i, setI] = useState(0);
  const autoplay = useAutoplay(() => setI((v) => (v + 1) % slides.length), 6000, slides.length > 1);

  const film = slides.find((s) => s.video);
  const wide = film && { w: film.width || 1920, h: film.height || 800 };
  const tall = film?.tallVideo ? { w: film.tallWidth || 1080, h: film.tallHeight || 1920 } : wide;
  const shape = film
    ? ({
        "--hero-wide": `${((wide!.h / wide!.w) * 100).toFixed(2)}vw`,
        "--hero-tall": `${((tall!.h / tall!.w) * 100).toFixed(2)}vw`,
      } as CSSProperties)
    : undefined;
  // Without a portrait cut, phones keep the usual minimum height (the wide video fills it).
  const height = film
    ? `landscape:h-[min(var(--hero-wide),90svh)] ${film.tallVideo ? "portrait:h-[min(var(--hero-tall),100svh)]" : "portrait:h-[max(var(--hero-wide),260px)]"}`
    : "h-[260px] sm:h-[380px] lg:h-[500px]";

  return (
    <section className={`relative overflow-hidden bg-ink ${height}`} style={shape} aria-roledescription="carousel" {...autoplay}>
      {slides.map((s, idx) => (
        <div
          key={idx}
          inert={idx !== i}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 motion-reduce:transition-none ${idx === i ? "opacity-100" : "opacity-0"}`}
          style={s.image && !s.video ? { backgroundImage: `url("${bgUrl(s.image)}")` } : undefined}
        >
          {s.video && (
            <>
              {(s.image || s.tallImage) && (
                <picture>
                  {s.tallImage && <source media="(orientation: portrait)" srcSet={s.tallImage} />}
                  <img src={(s.image || s.tallImage)!} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </picture>
              )}
              {idx === i && (
                <video
                  className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden
                >
                  {s.tallVideo && <source media="(orientation: portrait)" src={s.tallVideo} type="video/mp4" />}
                  <source src={s.video} type="video/mp4" />
                </video>
              )}
            </>
          )}
          <div className="default-margin relative flex h-full flex-col justify-center">
            <div
              className={`max-w-md transition-all duration-700 motion-reduce:transition-none ${idx === i ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              {s.eyebrow && <p className="mb-2 text-sm font-medium text-ink sm:text-base">{s.eyebrow}</p>}
              {s.title.length > 0 && (
                <h2 className="mb-5 text-2xl font-bold leading-tight text-ink sm:text-4xl">
                  {s.title.map((line, n) => (
                    <span key={n} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              )}
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
