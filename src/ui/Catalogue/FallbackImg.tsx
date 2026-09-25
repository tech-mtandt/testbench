"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, type ImgHTMLAttributes } from "react";

/** <img> that swaps to a local legacy copy when the primary (Payload/Supabase) URL fails, even before hydration. */
export default function FallbackImg({
  src,
  fallback,
  alt = "",
  ...rest
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src?: string | null; fallback?: string | null }) {
  const ref = useRef<HTMLImageElement>(null);
  const swap = () => {
    const el = ref.current;
    if (el && fallback && !el.src.endsWith(fallback)) el.src = fallback;
  };
  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) swap();
  });
  const first = src || fallback;
  if (!first) return null;
  return <img ref={ref} src={first} alt={alt} loading="lazy" decoding="async" onError={swap} {...rest} />;
}
