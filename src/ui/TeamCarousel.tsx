"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAutoplay } from "@/components/useAutoplay";
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

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/** Breakpoint index matching the CSS below: 0 phones, 1 ≥480px, 2 md, 3 lg; -1 while server rendering. */
function useBreakpoint() {
  return useSyncExternalStore(
    subscribeResize,
    () => {
      const w = window.innerWidth;
      return w >= 1024 ? 3 : w >= 768 ? 2 : w >= 480 ? 1 : 0;
    },
    () => -1,
  );
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
  // Portraits per view at each breakpoint (1 / 2 / up to 3 / perView), never more than there are
  // members. Slide widths come from CSS, so the server render already has the final layout.
  const counts = [1, 2, Math.min(3, perView), perView].map((c) => Math.max(1, Math.min(members.length, c)));
  const breakpoint = useBreakpoint();
  const canSlide = breakpoint >= 0 && members.length > counts[breakpoint];

  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  const autoplay = useAutoplay(() => setIndex((prev) => Math.min(prev + 1, members.length)), INTERVAL_MS, canSlide);

  // After sliding onto the copies of the first portraits, jump back to the real ones unanimated.
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

  const copies = members.length > 1 ? members.slice(0, Math.max(...counts)) : [];
  const circle = size === "lg" ? "h-44 w-44" : "h-36 w-36 md:h-[150px] md:w-[150px]";
  const vars = Object.fromEntries(counts.map((c, i) => [`--per-view-${i}`, c])) as React.CSSProperties;

  return (
    // Reduced motion: no autoplay, so the row scrolls by hand instead.
    <div
      className="min-w-0 overflow-hidden motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:overflow-x-auto"
      {...autoplay}
    >
      <div
        className={`flex [--per-view:var(--per-view-0)] min-[480px]:[--per-view:var(--per-view-1)] md:[--per-view:var(--per-view-2)] lg:[--per-view:var(--per-view-3)] ${withTransition ? "transition-transform ease-in-out" : ""}`}
        style={{
          ...vars,
          transitionDuration: `${TRANSITION_MS}ms`,
          transform: canSlide ? `translateX(calc(-100% / var(--per-view) * ${index}))` : undefined,
        }}
      >
        {[...members, ...copies].map((member, i) => (
          <div
            key={`${member.id}-${i}`}
            inert={i >= members.length}
            className={`flex w-[calc(100%/var(--per-view))] shrink-0 snap-start flex-col items-center gap-1 px-2 text-center ${
              i >= members.length ? "motion-reduce:hidden" : ""
            }`}
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
