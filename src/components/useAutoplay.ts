"use client";

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True when the visitor asked for reduced motion (false while server rendering). */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(REDUCED_MOTION).matches, () => false);
}

/**
 * Carousel autoplay: calls `advance` every `ms` while `enabled`. It pauses while the pointer is
 * over the carousel or focus is inside it, and never runs for visitors who prefer reduced
 * motion. Spread the returned handlers on the carousel's root element.
 */
export function useAutoplay(advance: () => void, ms: number, enabled = true) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const running = enabled && !reduced && !hovered && !focused;
  const tick = useEffectEvent(advance);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => tick(), ms);
    return () => clearInterval(timer);
  }, [running, ms]);

  return {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
    },
  };
}
