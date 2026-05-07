import type { Metadata } from "next";
import {
  getCollectionsWithProducts,
  type CollectionWithProducts,
} from "@/lib/shopify";
import { sortByDisplayOrder } from "@/lib/collection-labels";
import { getShopConfig } from "@/lib/shop-config";
import ShopBrowser from "@/components/shop/ShopBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Buy iPhones, Samsung Galaxy, AirPods, Apple Watch, PlayStation, accessories, and more from Moving Mobiles Tech in Wilton, CT.",
};

// Revalidate every 10s — fresh inventory without re-deploying.
// For instant updates, configure a Shopify webhook to /api/revalidate.
export const revalidate = 10;

export default async function ShopPage() {
  const [raw, config] = await Promise.all([
    getCollectionsWithProducts(),
    getShopConfig(),
  ]);
  const collections = applyConfig(raw, config);

  return (
    <>
      <section className="tile-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-10 text-center">
          <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
            Shop
          </div>
          <h1
            className="mx-auto mt-3 max-w-3xl font-semibold leading-[1.07] tracking-[-0.005em]"
            style={{ fontSize: "clamp(36px, 6vw, 56px)" }}
          >
            All Products & Accessories
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
            Refurbished and new — every device is tested, certified, and
            backed by our 90-day warranty.
          </p>
        </div>
      </section>

      <section className="tile-parchment">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
          <ShopBrowser collections={collections} />
        </div>
      </section>
    </>
  );
}

/**
 * Apply staff-managed config (Upstash Redis) to the raw collections.
 *
 * - Reorders collections per `config.collections` array order
 * - For each collection that has `featured` IDs, pins those products
 *   to the front of its product list (so the carousel picks them as
 *   the first 5)
 * - Skips collections marked `hidden`
 * - Falls back to default `sortByDisplayOrder` when no config is saved
 */
function applyConfig(
  raw: CollectionWithProducts[],
  config: Awaited<ReturnType<typeof getShopConfig>>,
): CollectionWithProducts[] {
  if (!config) return sortByDisplayOrder(raw);

  const lookup = new Map(raw.map((c) => [c.handle, c]));
  const seen = new Set<string>();
  const ordered: CollectionWithProducts[] = [];

  for (const item of config.collections) {
    if (item.hidden) {
      seen.add(item.handle);
      continue;
    }
    const c = lookup.get(item.handle);
    if (!c) continue;
    seen.add(item.handle);

    if (item.featured && item.featured.length > 0) {
      const featuredIds = new Set(item.featured);
      const featuredFirst = item.featured
        .map((id) => c.products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));
      const rest = c.products.filter((p) => !featuredIds.has(p.id));
      ordered.push({ ...c, products: [...featuredFirst, ...rest] });
    } else {
      ordered.push(c);
    }
  }

  // Append any new collections that weren't in the saved config yet
  // (Shopify admin may have added new collections since last save)
  for (const c of raw) {
    if (!seen.has(c.handle)) ordered.push(c);
  }

  return ordered;
}
