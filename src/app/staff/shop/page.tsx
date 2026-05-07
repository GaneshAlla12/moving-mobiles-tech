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

  const initialOrder = sortByDisplayOrder(raw).map((c) => c.handle);
  const initialItems = config
    ? config.collections
    : initialOrder.map((handle) => ({
        handle,
        hidden: false,
        featured: [] as number[],
      }));

  const totalCollections = initialItems.length;
  const totalFeatured = initialItems.reduce(
    (sum, c) => sum + c.featured.length,
    0
  );

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--canvas-sunken)]">
      {/* Page header — refined */}
      <header className="border-b border-[var(--hairline)] bg-[var(--canvas)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="eyebrow flex items-center gap-2">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
                Staff · Shop CMS
              </div>
              <h1 className="mt-3 h-display-md">Manage shop layout</h1>
              <p className="mt-3 text-[15px] text-[var(--ink-muted-60)] leading-[1.55] max-w-2xl">
                Reorder which sections appear on the public shop, hide sections
                you don&apos;t want shown, and pick up to 6 featured products
                to showcase in each carousel.
              </p>
            </div>

            {/* Stats card */}
            <div
              className="grid grid-cols-3 gap-6 rounded-[16px] px-6 py-4"
              style={{
                background: "var(--canvas-elevated)",
                border: "1px solid var(--hairline)",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <DashStat label="Collections" value={totalCollections} />
              <DashStat label="Featured" value={totalFeatured} />
              <DashStat
                label="Storage"
                value={isShopConfigConfigured() ? "Live" : "—"}
                indicator={
                  isShopConfigConfigured() ? "#22c55e" : "var(--ink-muted-48)"
                }
              />
            </div>
          </div>

          {!isShopConfigConfigured() && (
            <div
              className="mt-7 rounded-[14px] p-5 flex gap-3 items-start"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,193,7,0.08), rgba(255,193,7,0.04))",
                border: "1px solid rgba(255, 193, 7, 0.25)",
              }}
            >
              <div
                className="grid place-items-center w-9 h-9 rounded-full shrink-0"
                style={{
                  background: "rgba(255, 193, 7, 0.15)",
                  color: "#b45309",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-[var(--ink)]">
                  Storage not configured
                </div>
                <p className="mt-1 text-[13px] text-[var(--ink-muted-60)] leading-[1.55]">
                  Set{" "}
                  <code
                    className="rounded px-1.5 py-0.5 text-[12px]"
                    style={{
                      background: "var(--canvas-sunken)",
                      border: "1px solid var(--hairline)",
                    }}
                  >
                    UPSTASH_REDIS_REST_URL
                  </code>{" "}
                  and{" "}
                  <code
                    className="rounded px-1.5 py-0.5 text-[12px]"
                    style={{
                      background: "var(--canvas-sunken)",
                      border: "1px solid var(--hairline)",
                    }}
                  >
                    UPSTASH_REDIS_REST_TOKEN
                  </code>{" "}
                  in your Vercel project to enable saving. Free signup at{" "}
                  <a
                    href="https://upstash.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    upstash.com
                  </a>
                  . Until configured, you can preview changes here but they
                  won&apos;t persist.
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Editor */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <ShopConfigEditor collections={raw} initialItems={initialItems} />
      </div>
    </div>
  );
}

function DashStat({
  label,
  value,
  indicator,
}: {
  label: string;
  value: number | string;
  indicator?: string;
}) {
  return (
    <div className="text-center min-w-[64px]">
      <div className="font-semibold text-[var(--ink)] text-[24px] leading-none tabular-nums flex items-center justify-center gap-1.5">
        {indicator && (
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: indicator }}
          />
        )}
        {value}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium">
        {label}
      </div>
    </div>
  );
}
