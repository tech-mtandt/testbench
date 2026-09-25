"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

/**
 * <img> that walks a list of candidate URLs (Payload media first, scraped legacy copy
 * next) and falls through on load errors. Renders nothing when every source fails.
 */
export default function FallbackImg({
  sources,
  alt = "",
  loading = "lazy",
  ...rest
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { sources: (string | null | undefined)[] }) {
  const list = [...new Set(sources.filter((s): s is string => Boolean(s)))];
  const [i, setI] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const src = list[i];

  // An SSR'd <img> can fail before hydration, when React's onError isn't attached yet.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setI((n) => n + 1);
  }, [src]);

  if (!src) return null;
  return <img ref={ref} key={src} src={src} alt={alt} loading={loading} decoding="async" onError={() => setI((n) => n + 1)} {...rest} />;
}
