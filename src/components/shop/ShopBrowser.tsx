"use client";

import { useMemo, useState } from "react";
import type { CollectionWithProducts, ShopifyProduct } from "@/lib/shopify";
import { labelFor } from "@/lib/collection-labels";
import CollectionCarousel from "./CollectionCarousel";
import ShopProductCard from "./ShopProductCard";

const SEARCH_RESULT_LIMIT = 60;

export default function ShopBrowser({
  collections,
}: {
  collections: CollectionWithProducts[];
}) {
  const [query, setQuery] = useState("");

  // Flat deduplicated product list across every collection
  const allProducts = useMemo(() => {
    const seen = new Set<number>();
    const out: ShopifyProduct[] = [];
    for (const c of collections) {
      for (const p of c.products) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          out.push(p);
        }
      }
    }
    return out;
  }, [collections]);

  const trimmed = query.trim();
  const isSearching = trimmed.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = trimmed.toLowerCase();
    return allProducts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.vendor.toLowerCase().includes(q),
      )
      .slice(0, SEARCH_RESULT_LIMIT);
  }, [trimmed, isSearching, allProducts]);

  const jumpTo = (handle: string) => {
    const el = document.getElementById(`collection-${handle}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* Search bar */}
      <div className="mt-4 mb-8">
        <label className="relative block max-w-2xl mx-auto">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ink-muted-48)]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for iPhone, AirPods, cables, repair…"
            aria-label="Search products"
            className="w-full rounded-full border border-[var(--hairline)] bg-[var(--canvas)] py-3.5 pl-12 pr-12 text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted-48)] focus:border-[var(--ink)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-soft)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-[var(--surface)] text-[var(--ink-muted-48)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </label>
      </div>

      {/* Category quick-jump (only when not searching) */}
      {!isSearching && (
        <div className="mb-12">
          <div className="text-center mb-5">
            <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
              Browse by category
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {collections.map((c) => (
              <button
                key={c.handle}
                onClick={() => jumpTo(c.handle)}
                className="rounded-full border border-[var(--hairline)] bg-[var(--canvas)] px-4 py-2 text-[13px] text-[var(--ink-muted-80)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
              >
                {labelFor(c.handle, c.title)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Body: either search results or the carousel sections */}
      {isSearching ? (
        <SearchResults
          query={trimmed}
          results={searchResults}
          totalProducts={allProducts.length}
          onClear={() => setQuery("")}
        />
      ) : (
        <div>
          {collections.map((c) => (
            <CollectionCarousel key={c.handle} collection={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResults({
  query,
  results,
  totalProducts,
  onClear,
}: {
  query: string;
  results: ShopifyProduct[];
  totalProducts: number;
  onClear: () => void;
}) {
  if (results.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="text-[19px] font-semibold tracking-[-0.011em]">
          No matches for &ldquo;{query}&rdquo;
        </div>
        <p className="mt-3 text-[15px] text-[var(--ink-muted-48)]">
          We searched {totalProducts} products. Try a different word, or
          browse by category.
        </p>
        <button
          onClick={onClear}
          className="mt-6 rounded-full px-5 py-2 text-[14px] font-medium border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
        >
          Clear search
        </button>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-6 text-[14px] text-[var(--ink-muted-80)]">
        <span className="font-semibold text-[var(--ink)] tabular-nums">
          {results.length}
        </span>{" "}
        {results.length === 1 ? "result" : "results"} for{" "}
        <span className="font-semibold text-[var(--ink)]">
          &ldquo;{query}&rdquo;
        </span>
      </div>
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((p) => (
          <ShopProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
