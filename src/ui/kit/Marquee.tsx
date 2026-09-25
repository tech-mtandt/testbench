import type { ReactNode } from "react";

/** Infinite, pause-on-hover marquee. Children are rendered twice for a seamless loop. */
export default function Marquee({ children, className = "", slow }: { children: ReactNode; className?: string; slow?: boolean }) {
  return (
    <div className={`group mask-fade-x overflow-hidden ${className}`}>
      <div
        className={`flex w-max animate-marquee items-center gap-12 group-hover:[animation-play-state:paused] ${slow ? "[animation-duration:70s]" : ""}`}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
