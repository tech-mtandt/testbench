"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export type RelatedProduct = {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  imageAlt: string;
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-black"
    >
      {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

export default function RelatedProductsSlider({ products }: { products: RelatedProduct[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  const canSlide = products.length > 4;

  return (
    <div className="flex flex-col gap-6">
      <h2>Related Products</h2>

      <div className="relative">
        {canSlide && (
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Previous products"
            className="absolute left-0 top-1/2 z-10 flex h-20 w-10 -translate-y-1/2 items-center justify-center bg-primary-yellow"
          >
            <ChevronIcon direction="left" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex snap-x gap-6 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group relative flex w-56 shrink-0 snap-start flex-col bg-white pb-8 sm:w-60 lg:w-64"
            >
              <div className="relative aspect-square w-full bg-black/[0.03]">
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.imageAlt}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                )}
              </div>
              <p className="mt-4 truncate px-2 text-sm font-bold uppercase">{product.title}</p>
              <span className="absolute -bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-primary-yellow text-lg font-bold text-black">
                +
              </span>
            </Link>
          ))}
        </div>

        {canSlide && (
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Next products"
            className="absolute right-0 top-1/2 z-10 flex h-20 w-10 -translate-y-1/2 items-center justify-center bg-primary-yellow"
          >
            <ChevronIcon direction="right" />
          </button>
        )}
      </div>
    </div>
  );
}
