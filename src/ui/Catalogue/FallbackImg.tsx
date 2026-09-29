"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, type ImgHTMLAttributes } from "react";
import { legacySrcSet } from "@/lib/img";

/**
 * <img> with a fallback chain. When the legacy copy has pre-generated WebP variants they
 * load first (the Payload/Supabase original is the same picture at full size); on error
 * it tries the Payload URL, then the original legacy file. Works even before hydration.
 */
export default function FallbackImg({
  src,
  fallback,
  alt = "",
  sizes = "(max-width: 640px) 50vw, 25vw",
  ...rest
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src?: string | null; fallback?: string | null }) {
  const ref = useRef<HTMLImageElement>(null);
  const variants = fallback ? legacySrcSet(fallback) : null;
  const chain = [variants?.src, src, fallback].filter((u, i, a): u is string => !!u && a.indexOf(u) === i);
  const swap = () => {
    const el = ref.current;
    if (!el) return;
    const current = chain.findIndex((u) => el.src.endsWith(u));
    const next = chain[current + 1];
    if (next) {
      el.removeAttribute("srcset");
      el.src = next;
    }
  };
  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) swap();
  });
  if (!chain.length) return null;
  return (
    <img
      ref={ref}
      src={chain[0]}
      srcSet={variants?.srcSet}
      sizes={variants ? sizes : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={swap}
      {...rest}
    />
  );
}
