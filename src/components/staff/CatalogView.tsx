"use client";

import { useMemo, useState } from "react";
import type { StorefrontProduct } from "@/lib/shopify-storefront";

type Filter = "all" | "available" | "outOfStock";

export default function CatalogView({
  initialProducts,
}: {
  initialProducts: StorefrontProduct[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialProducts.filter((p) => {
      // Filter by availability
      if (filter === "available" && !p.anyAvailable) return false;
      if (filter === "outOfStock" && p.anyAvailable) return false;

      // Filter by search query (matches title, vendor, productType, tags)
      if (!q) return true;
      const haystack = [
        p.title,
        p.vendor,
        p.productType,
        ...p.tags,
        ...p.variants.map((v) => v.title),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [initialProducts, query, filter]);

  return (
    <div>
      {/* Search + filter bar */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink-muted-48)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, vendor, or variant…"
            className="w-full rounded-full pl-11 pr-4 py-3 text-[14.5px] bg-[var(--canvas)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-soft)] transition-all"
            style={{ border: "1px solid var(--hairline-strong)" }}
          />
        </div>

        <div
          className="inline-flex rounded-full p-1"
          style={{
            background: "var(--canvas)",
            border: "1px solid var(--hairline)",
          }}
        >
          <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
            All ({initialProducts.length})
          </FilterTab>
          <FilterTab
            active={filter === "available"}
            onClick={() => setFilter("available")}
          >
            Available ({initialProducts.filter((p) => p.anyAvailable).length})
          </FilterTab>
          <FilterTab
            active={filter === "outOfStock"}
            onClick={() => setFilter("outOfStock")}
          >
            Out of stock ({initialProducts.filter((p) => !p.anyAvailable).length})
          </FilterTab>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <>
          <div className="mb-4 text-[12.5px] text-[var(--ink-muted-60)] tabular-nums">
            Showing {filtered.length}{" "}
            {filtered.length === 1 ? "product" : "products"}
            {query && (
              <>
                {" "}
                matching <strong>&ldquo;{query}&rdquo;</strong>
              </>
            )}
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((p, i) => (
              <ProductCard key={`${p.title}-${i}`} product={p} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center rounded-full px-4 py-2 text-[13px] font-medium transition-all"
      style={
        active
          ? {
              background: "var(--canvas-elevated)",
              color: "var(--ink)",
              boxShadow: "var(--shadow-1)",
            }
          : { color: "var(--ink-muted-60)" }
      }
    >
      {children}
    </button>
  );
}

function ProductCard({ product }: { product: StorefrontProduct }) {
  const available = product.variants.filter((v) => v.availableForSale);
  const unavailable = product.variants.filter((v) => !v.availableForSale);

  const priceLabel =
    product.priceMin === product.priceMax
      ? `$${product.priceMin}`
      : `$${product.priceMin}–$${product.priceMax}`;

  return (
    <li
      className="rounded-[18px] p-5 sm:p-6 transition-all hover:scale-[1.005] hover:shadow-md"
      style={{
        background: "var(--canvas)",
        border: product.anyAvailable
          ? "1px solid var(--hairline)"
          : "1px solid rgba(245, 158, 11, 0.30)",
        boxShadow: "var(--shadow-1)",
      }}
    >
      {/* Header: title + availability dot */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {product.anyAvailable ? (
              <Badge tone="success">In stock</Badge>
            ) : (
              <Badge tone="warning">Out of stock</Badge>
            )}
            {product.productType && (
              <span className="text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-muted-48)]">
                {product.productType}
              </span>
            )}
          </div>
          <h3 className="text-[17px] font-semibold tracking-[-0.011em] text-[var(--ink)] leading-tight">
            {product.title}
          </h3>
          {product.vendor && (
            <div className="mt-0.5 text-[12px] text-[var(--ink-muted-48)]">
              {product.vendor}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[18px] font-semibold tabular-nums tracking-[-0.011em] text-[var(--ink)]">
            {priceLabel}
          </div>
        </div>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {product.tags.slice(0, 5).map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium"
              style={{
                background: "var(--canvas-elevated)",
                color: "var(--ink-muted-60)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Variants summary */}
      {product.variants.length > 0 && (
        <div
          className="rounded-[12px] p-3"
          style={{
            background: "var(--canvas-elevated)",
            border: "1px solid var(--hairline)",
          }}
        >
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-[var(--ink-muted-48)] font-semibold mb-2">
            Variants · {product.variants.length}
          </div>
          <div className="space-y-1.5">
            {product.variants.slice(0, 6).map((v, i) => (
              <div
                key={`${v.title}-${i}`}
                className="flex items-center justify-between gap-2 text-[12.5px]"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: v.availableForSale ? "#22c55e" : "#94a3b8",
                    }}
                  />
                  <span
                    className="truncate"
                    style={{
                      color: v.availableForSale
                        ? "var(--ink)"
                        : "var(--ink-muted-60)",
                      textDecoration: v.availableForSale
                        ? "none"
                        : "line-through",
                      textDecorationColor: "var(--ink-muted-32)",
                    }}
                  >
                    {v.title === "Default Title" ? "Default" : v.title}
                  </span>
                </span>
                <span className="text-[var(--ink-muted-60)] tabular-nums shrink-0">
                  ${v.price}
                </span>
              </div>
            ))}
            {product.variants.length > 6 && (
              <div className="text-[11px] text-[var(--ink-muted-48)] pt-1">
                + {product.variants.length - 6} more variants
              </div>
            )}
          </div>
          {available.length > 0 && unavailable.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--hairline)] text-[11px] text-[var(--ink-muted-60)]">
              {available.length} available · {unavailable.length} unavailable
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div
      className="rounded-[24px] p-14 text-center"
      style={{
        background: "var(--canvas)",
        border: "1px dashed var(--hairline-strong)",
      }}
    >
      <div
        className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ background: "var(--canvas-elevated)" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-muted-48)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div className="text-[19px] font-semibold tracking-[-0.011em]">
        {query ? `No products match "${query}"` : "No products visible"}
      </div>
      <p className="mt-3 text-[14px] text-[var(--ink-muted-60)] max-w-md mx-auto leading-[1.6]">
        {query
          ? "Try a different search, or check that the product is Active and has the Headless channel enabled in Shopify Admin."
          : "Check your Storefront API token and the Headless channel configuration in Shopify."}
      </p>
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "success" | "warning";
  children: React.ReactNode;
}) {
  const styles = {
    success: {
      bg: "rgba(34, 197, 94, 0.12)",
      fg: "#15803d",
      dot: "#22c55e",
    },
    warning: {
      bg: "rgba(245, 158, 11, 0.14)",
      fg: "#b45309",
      dot: "#f59e0b",
    },
  } as const;
  const t = styles[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
      style={{ background: t.bg, color: t.fg }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: t.dot }}
      />
      {children}
    </span>
  );
}
