"use client";

import type { CollectionWithProducts, ShopifyProduct } from "@/lib/shopify";
import ShopProductCard from "./ShopProductCard";
import CategoryNav from "./CategoryNav";

type Props = {
  collections: CollectionWithProducts[];
  /** Products to feature at the top. */
  featured: ShopifyProduct[];
};

// Handles for collections that should be hidden from the body
// because they're used as the Featured/Trending section instead.
const FEATURED_HANDLES = new Set(["home-page-cases", "top-picks"]);

export default function ShopGrid({ collections, featured }: Props) {
  const visible = collections.filter((c) => !FEATURED_HANDLES.has(c.handle));

  return (
    <div className="space-y-20">
      {/* Category dropdown nav — like the site header, grouped by Phones / Watches / etc. */}
      <CategoryNav collections={collections} />

      {/* Trending / Featured */}
      {featured.length > 0 && (
        <section>
          <h2 className="trending-heading text-center">Trending Products &amp; Services</h2>
          <div className="mt-10 grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((p) => (
              <ShopProductCard key={`feat-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Each Shopify collection as its own section */}
      {visible.map((c) => (
        <section key={c.id} id={c.handle}>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2
              className="font-semibold tracking-[-0.005em] leading-[1.05]"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
            >
              {c.title}
            </h2>
          </div>
          <div className="mt-8 grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {c.products.map((p) => (
              <ShopProductCard key={`${c.handle}-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
