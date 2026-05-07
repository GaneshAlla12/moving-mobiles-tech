"use client";

import Link from "next/link";
import { useRef } from "react";
import type { CollectionWithProducts } from "@/lib/shopify";
import { labelFor } from "@/lib/collection-labels";
import ShopProductCard from "./ShopProductCard";

const PREVIEW_COUNT = 5;

export default function CollectionCarousel({
  collection,
}: {
  collection: CollectionWithProducts;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = collection.products.slice(0, PREVIEW_COUNT);
  if (products.length === 0) return null;

  const label = labelFor(collection.handle, collection.title);
  const collectionUrl = `/shop/c/${collection.handle}`;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll by the visible width of one item (~ container / cards-visible)
    // Multiply by 1 so each click moves by one card.
    const card = el.querySelector<HTMLElement>("[data-card]");
    const cardWidth = card?.offsetWidth ?? 280;
    const gap = 20; // matches gap-5
    el.scrollBy({ left: dir * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <section
      id={`collection-${collection.handle}`}
      className="scroll-mt-32 py-12 border-b border-[var(--hairline)] last:border-b-0"
    >
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-semibold tracking-[-0.011em] leading-[1.2]">
          {label}
        </h2>
        <div className="hidden sm:flex gap-2 shrink-0">
          <button
            onClick={() => scrollBy(-1)}
            aria-label={`Previous ${label} products`}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label={`Next ${label} products`}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel — scroll-snap horizontal scroller */}
      <div
        ref={scrollRef}
        className="
          flex gap-5 overflow-x-auto pb-4 -mx-4 sm:-mx-0 px-4 sm:px-0
          snap-x snap-mandatory
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {products.map((p) => (
          <div
            key={p.id}
            data-card
            className="
              snap-start shrink-0
              w-[70%]
              sm:w-[calc((100%-20px)/2)]
              md:w-[calc((100%-2*20px)/3)]
              lg:w-[calc((100%-3*20px)/4)]
            "
          >
            <ShopProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href={collectionUrl}
          className="inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-[14px] font-medium border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
        >
          Shop {label}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
