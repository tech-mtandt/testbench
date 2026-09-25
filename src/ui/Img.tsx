/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";

/**
 * Plain <img> for legacy/scraped assets and Payload media whose intrinsic sizes
 * are unknown. Lazy by default. Use next/image where dimensions are known.
 */
export default function Img({ src, alt = "", loading = "lazy", ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;
  return <img src={src} alt={alt} loading={loading} decoding="async" {...rest} />;
}
