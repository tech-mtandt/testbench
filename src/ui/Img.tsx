/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";
import { legacySrcSet } from "@/lib/img";

const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/**
 * Plain <img> for legacy/scraped assets and Payload media whose intrinsic sizes
 * are unknown. Lazy by default. Legacy rasters get a responsive WebP srcset
 * (pass `sizes` when the image renders much larger/smaller than the default).
 * Use next/image where dimensions are known.
 */
/** Shown instead of a missing product photo (e.g. new products before photos are added). */
export function PhotoPending({ label = "Photo coming soon" }: { label?: string }) {
  return <span className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/30">{label}</span>;
}

export default function Img({
  src,
  alt = "",
  loading = "lazy",
  sizes,
  pending,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { pending?: boolean }) {
  if (!src) return pending ? <PhotoPending /> : null;
  const variants = typeof src === "string" && !rest.srcSet ? legacySrcSet(src) : null;
  if (variants)
    return <img src={variants.src} srcSet={variants.srcSet} sizes={sizes ?? DEFAULT_SIZES} alt={alt} loading={loading} decoding="async" {...rest} />;
  return <img src={src} alt={alt} loading={loading} decoding="async" sizes={sizes} {...rest} />;
}
