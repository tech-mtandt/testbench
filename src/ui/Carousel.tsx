"use client";

import { Children, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/ui/Icons";

/** Scroll-snap carousel with yellow side arrows (matches the live product slider). */
export default function Carousel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  // Arrows only when there is something to scroll to, whatever the item count or screen size.
  const [overflowing, setOverflowing] = useState(false);
  const count = Children.count(children);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setOverflowing(el.scrollWidth > el.clientWidth + 1));
    observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div className={`relative min-w-0 ${className}`}>
      {overflowing && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-10 flex h-11 w-6 -translate-y-1/2 items-center justify-center bg-brand text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {/* Bottom padding leaves room for badges hanging off the cards (e.g. ProductCard's "+"). */}
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-8 pt-3 pb-6">
        {children}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-10 flex h-11 w-6 -translate-y-1/2 items-center justify-center bg-brand text-ink"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
