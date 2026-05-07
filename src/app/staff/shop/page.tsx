import type { Metadata } from "next";
import { getCollectionsWithProducts } from "@/lib/shopify";
import { sortByDisplayOrder } from "@/lib/collection-labels";
import { getShopConfig, isShopConfigConfigured } from "@/lib/shop-config";
import ShopConfigEditor from "@/components/staff/ShopConfigEditor";

export const metadata: Metadata = {
  title: "Manage shop layout",
};

export const revalidate = 0; // always fresh in the editor

export default async function StaffShopPage() {
  const [raw, config] = await Promise.all([
    getCollectionsWithProducts(),
    getShopConfig(),
  ]);

  // If no config saved yet: seed the editor with the default order
  const initialOrder = sortByDisplayOrder(raw).map((c) => c.handle);
  const initialItems = config
    ? config.collections
    : initialOrder.map((handle) => ({
        handle,
        hidden: false,
        featured: [] as number[],
      }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
        Staff · Shop CMS
      </div>
      <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.011em] leading-[1.1]">
        Manage shop layout
      </h1>
      <p className="mt-3 text-[15px] text-[var(--ink-muted-80)] leading-[1.5] max-w-2xl">
        Reorder which sections appear on the public shop, hide sections
        you don&apos;t want shown, and pick up to 6 featured products to
        showcase in each carousel.
      </p>

      {!isShopConfigConfigured() && (
        <div className="mt-6 rounded-[14px] border border-amber-300 bg-amber-50 p-4 text-[14px] text-amber-900">
          <div className="font-semibold">Storage not configured</div>
          <p className="mt-1 text-amber-800">
            Set <code className="rounded bg-white/60 px-1.5 py-0.5">UPSTASH_REDIS_REST_URL</code>{" "}
            and{" "}
            <code className="rounded bg-white/60 px-1.5 py-0.5">UPSTASH_REDIS_REST_TOKEN</code>{" "}
            in your Vercel project to enable saving. Free signup at{" "}
            <a
              href="https://upstash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              upstash.com
            </a>
            . Until configured, you can preview changes here but they
            won&apos;t persist.
          </p>
        </div>
      )}

      <div className="mt-8">
        <ShopConfigEditor collections={raw} initialItems={initialItems} />
      </div>
    </div>
  );
}
