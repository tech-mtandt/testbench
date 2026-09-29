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
export default function Img({ src, alt = "", loading = "lazy", sizes, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;
  const variants = typeof src === "string" && !rest.srcSet ? legacySrcSet(src) : null;
  if (variants)
    return <img src={variants.src} srcSet={variants.srcSet} sizes={sizes ?? DEFAULT_SIZES} alt={alt} loading={loading} decoding="async" {...rest} />;
  return <img src={src} alt={alt} loading={loading} decoding="async" sizes={sizes} {...rest} />;
}
