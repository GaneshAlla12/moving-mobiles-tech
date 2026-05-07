import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCollections,
  getCollectionProducts,
} from "@/lib/shopify";
import { labelFor } from "@/lib/collection-labels";
import ShopProductCard from "@/components/shop/ShopProductCard";

export const revalidate = 10;

export async function generateMetadata(
  props: PageProps<"/shop/c/[handle]">,
): Promise<Metadata> {
  const { handle } = await props.params;
  const all = await getAllCollections();
  const c = all.find((x) => x.handle === handle);
  if (!c) return {};
  const label = labelFor(c.handle, c.title);
  return {
    title: label,
    description: `Browse all ${label.toLowerCase()} at Moving Mobiles Tech.`,
  };
}

export default async function CollectionPage(
  props: PageProps<"/shop/c/[handle]">,
) {
  const { handle } = await props.params;
  const [all, products] = await Promise.all([
    getAllCollections(),
    getCollectionProducts(handle),
  ]);
  const meta = all.find((x) => x.handle === handle);
  if (!meta || products.length === 0) notFound();
  const label = labelFor(meta.handle, meta.title);

  return (
    <>
      <section className="tile-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
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
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Shop
          </Link>

          <div className="mt-6 text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
            Collection
          </div>
          <h1
            className="mt-2 font-semibold leading-[1.07] tracking-[-0.005em]"
            style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            {label}
          </h1>
          <p className="mt-3 text-[15px] text-[var(--ink-muted-80)]">
            <span className="font-semibold text-[var(--ink)] tabular-nums">
              {products.length}
            </span>{" "}
            {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </section>

      <section className="tile-parchment">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
