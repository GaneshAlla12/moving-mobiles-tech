import type { Metadata } from "next";
import {
  listAllProducts,
  type StorefrontProduct,
} from "@/lib/shopify-storefront";
import CatalogView from "@/components/staff/CatalogView";

export const metadata: Metadata = {
  title: "Catalog audit",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffCatalogPage() {
  let products: StorefrontProduct[] = [];
  let fetchedAt = "";
  let truncated = false;
  let loadError: string | null = null;

  try {
    const result = await listAllProducts();
    products = result.products;
    fetchedAt = result.fetchedAt;
    truncated = result.truncated;
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  const totalVariants = products.reduce((n, p) => n + p.variants.length, 0);
  const availableVariants = products.reduce(
    (n, p) => n + p.variants.filter((v) => v.availableForSale).length,
    0,
  );
  const fullyAvailable = products.filter((p) => p.anyAvailable).length;
  const fullyOutOfStock = products.filter((p) => !p.anyAvailable).length;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--canvas-sunken)]">
      {/* Hero */}
      <header
        className="relative overflow-hidden border-b border-[var(--hairline)]"
        style={{ background: "var(--canvas)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, var(--primary-soft) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-14 pb-12">
          <div className="eyebrow flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            Staff · Catalog audit
          </div>

          <h1
            className="mt-4 font-semibold leading-[1.05] tracking-[-0.022em]"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            What Maria can see.
          </h1>

          <p className="mt-5 text-[17px] text-[var(--ink-muted-60)] leading-[1.55] max-w-2xl">
            Every active product visible to the voice agent. If a product is in
            your Shopify Admin but missing here, check its{" "}
            <strong>Status</strong> (must be Active) and <strong>Sales channels</strong>{" "}
            (Headless must be enabled).
          </p>

          {/* Stat tiles */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 max-w-4xl">
            <StatCard
              label="Products"
              value={products.length}
              tone="primary"
              hint="Visible to Maria"
            />
            <StatCard
              label="Available"
              value={fullyAvailable}
              tone="success"
              hint="At least one variant in stock"
            />
            <StatCard
              label="Out of stock"
              value={fullyOutOfStock}
              tone="warning"
              hint="All variants unavailable"
            />
            <StatCard
              label="Variants in stock"
              value={`${availableVariants} / ${totalVariants}`}
              tone="primary"
              hint="Per-SKU availability"
            />
          </div>

          {loadError && (
            <div
              className="mt-8 rounded-[16px] p-5 text-[14px] text-[var(--ink-muted-80)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(239,68,68,0.10), rgba(239,68,68,0.04))",
                border: "1px solid rgba(239, 68, 68, 0.28)",
              }}
            >
              <div className="font-semibold text-[#b91c1c] mb-1">
                Couldn&apos;t load products from Shopify
              </div>
              <code className="rounded bg-[var(--canvas)] px-1.5 py-0.5 border border-[var(--hairline)] text-[12px]">
                {loadError}
              </code>
            </div>
          )}

          {truncated && (
            <div
              className="mt-8 rounded-[16px] p-5 text-[14px]"
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                color: "#b45309",
                border: "1px solid rgba(245, 158, 11, 0.32)",
              }}
            >
              Showing the first {products.length} products — your catalog has
              more. Bump <code>maxProducts</code> in{" "}
              <code>listAllProducts()</code> if you need to audit everything.
            </div>
          )}

          {fetchedAt && (
            <div className="mt-6 text-[12px] text-[var(--ink-muted-48)] tabular-nums">
              Fetched live from Shopify · {formatDateTime(fetchedAt)}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
        <CatalogView initialProducts={products} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number | string;
  tone: "primary" | "success" | "warning";
  hint: string;
}) {
  const toneStyles: Record<typeof tone, { dot: string }> = {
    primary: { dot: "#0071e3" },
    success: { dot: "#22c55e" },
    warning: { dot: "#f59e0b" },
  };
  const t = toneStyles[tone];

  return (
    <div
      className="rounded-[18px] p-5 sm:p-6 transition-all hover:scale-[1.01]"
      style={{
        background: "var(--canvas)",
        border: "1px solid var(--hairline)",
        boxShadow: "var(--shadow-1)",
      }}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted-60)] font-medium">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: t.dot }}
        />
        {label}
      </div>
      <div
        className="mt-3 font-semibold tabular-nums leading-none tracking-[-0.025em] text-[var(--ink)]"
        style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
      >
        {value}
      </div>
      <div className="mt-2 text-[12px] text-[var(--ink-muted-48)]">{hint}</div>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
