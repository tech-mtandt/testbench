"use client";

import { useEffect, useState } from "react";
import FallbackImg from "@/ui/Catalogue/FallbackImg";

export type TeamMember = {
  id: string;
  name: string;
  designation?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  /** Local legacy copy, used if the Payload media URL fails to load. */
  fallbackUrl?: string | null;
};

const INTERVAL_MS = 3000;
const TRANSITION_MS = 700;

function useItemsPerView(max: number, perView: number) {
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      const columns = width >= 1024 ? perView : width >= 768 ? Math.min(3, perView) : width >= 480 ? 2 : 1;
      setItemsPerView(Math.max(1, Math.min(max, columns)));
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [max, perView]);

  return itemsPerView;
}

/** Auto-sliding row of round portraits (legacy owl-carousel on About Us). */
export default function TeamCarousel({
  members,
  perView = 5,
  size = "md",
}: {
  members: TeamMember[];
  perView?: number;
  size?: "md" | "lg";
}) {
  const itemsPerView = useItemsPerView(members.length || 1, perView);
  const canSlide = members.length > itemsPerView;

  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  useEffect(() => {
    if (!canSlide) return;
    const timer = setInterval(() => setIndex((prev) => prev + 1), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [canSlide]);

  useEffect(() => {
    if (!canSlide || index !== members.length) return;
    const timeout = setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
    }, TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [index, canSlide, members.length]);

  useEffect(() => {
    if (withTransition) return;
    const raf = requestAnimationFrame(() => setWithTransition(true));
    return () => cancelAnimationFrame(raf);
  }, [withTransition]);

  if (members.length === 0) return null;

  const slides = canSlide ? [...members, ...members.slice(0, itemsPerView)] : members;
  const circle = size === "lg" ? "h-44 w-44" : "h-36 w-36 md:h-[150px] md:w-[150px]";

  return (
    <div className="min-w-0 overflow-hidden">
      <div
        className={`flex ${withTransition ? "transition-transform ease-in-out" : ""}`}
        style={{
          transitionDuration: `${TRANSITION_MS}ms`,
          transform: canSlide ? `translateX(-${index * (100 / itemsPerView)}%)` : undefined,
        }}
      >
        {slides.map((member, i) => (
          <div
            key={`${member.id}-${i}`}
            className="flex shrink-0 flex-col items-center gap-1 px-2 text-center"
            style={{ width: `${100 / itemsPerView}%` }}
            aria-hidden={i >= members.length || undefined}
          >
            <div className={`${circle} mb-2 overflow-hidden rounded-full bg-neutral-800`}>
              <FallbackImg
                src={member.imageUrl}
                fallback={member.fallbackUrl}
                alt={member.imageAlt || member.name}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm font-semibold text-ink">{member.name}</p>
            {member.designation && <p className="text-[11px] text-ink-soft">{member.designation}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
