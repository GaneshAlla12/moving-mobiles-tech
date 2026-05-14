"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import {
  formatPrice,
  imageForVariant,
  type ShopifyProduct,
  type ShopifyVariant,
} from "@/lib/shopify";

export default function ProductDetail({
  product,
}: {
  product: ShopifyProduct;
}) {
  const { addLine } = useCart();

  // Track selection per option (e.g. {"Color": "Black", "Storage": "256GB"})
  const initialSel: Record<string, string> = useMemo(() => {
    const obj: Record<string, string> = {};
    const firstAvail = product.variants.find((v) => v.available) ?? product.variants[0];
    if (firstAvail) {
      product.options.forEach((opt, i) => {
        obj[opt.name] = firstAvail.options[i] ?? "";
      });
    }
    return obj;
  }, [product]);

  const [selection, setSelection] = useState<Record<string, string>>(initialSel);
  const [imageIdx, setImageIdx] = useState(0);

  const selectedVariant: ShopifyVariant | undefined = useMemo(() => {
    return product.variants.find((v) =>
      product.options.every((opt, i) => v.options[i] === selection[opt.name]),
    );
  }, [product, selection]);

  const activeImage = useMemo(() => {
    if (selectedVariant) {
      const fromVariant = imageForVariant(product, selectedVariant);
      if (fromVariant) {
        const idx = product.images.findIndex((i) => i.src === fromVariant.src);
        if (idx >= 0 && idx !== imageIdx) setImageIdx(idx);
      }
    }
    return product.images[imageIdx] ?? product.images[0] ?? null;
  }, [selectedVariant, product, imageIdx]);

  const onAdd = () => {
    if (!selectedVariant || !selectedVariant.available || selectedVariant.price <= 0) return;
    addLine({
      variantId: selectedVariant.id,
      productId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      variantTitle:
        selectedVariant.options.join(" / ") || selectedVariant.title,
      price: selectedVariant.price,
      imageSrc: activeImage?.src,
    });
  };

  const canBuy = selectedVariant?.available && (selectedVariant?.price ?? 0) > 0;
  const noPrice = (selectedVariant?.price ?? 0) <= 0;

  return (
    <section className="tile-light">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-4">
        <Link
          href="/shop"
          className="text-[13px] text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
        >
          ← Shop
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 pb-20 md:grid-cols-2 md:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[var(--surface)]">
            {activeImage ? (
              <Image
                src={activeImage.src}
                alt={activeImage.alt || product.title}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-[var(--ink-muted-48)]">
                No image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-6 gap-2">
              {product.images.slice(0, 12).map((img, i) => (
                <button
                  key={img.src + i}
                  onClick={() => setImageIdx(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative aspect-square rounded-[10px] overflow-hidden border ${i === imageIdx ? "border-[var(--ink)]" : "border-[var(--hairline)]"}`}
                >
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
            {product.vendor || "Moving Mobiles"}
          </div>
          <h1
            className="mt-3 font-semibold leading-[1.07] tracking-[-0.005em]"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            {product.title}
          </h1>

          <div className="mt-5">
            {selectedVariant && selectedVariant.price > 0 ? (
              <div className="flex items-baseline gap-3">
                <span className="text-[28px] font-semibold tabular-nums">
                  {formatPrice(selectedVariant.price)}
                </span>
                {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                  <span className="text-[15px] text-[var(--ink-muted-48)] line-through tabular-nums">
                    {formatPrice(selectedVariant.compareAtPrice)}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-[18px] text-[var(--ink-muted-48)]">
                Contact for price
              </div>
            )}
          </div>

          {/* Options */}
          {product.options.map((opt) => {
            // Skip "Title" placeholder option some products have
            if (opt.name === "Title") return null;
            return (
              <div key={opt.name} className="mt-7">
                <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
                  {opt.name}
                  {selection[opt.name] && (
                    <span className="ml-2 text-[var(--ink)] normal-case tracking-normal font-semibold">
                      {selection[opt.name]}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const isSel = selection[opt.name] === val;
                    return (
                      <button
                        key={val}
                        onClick={() =>
                          setSelection((s) => ({ ...s, [opt.name]: val }))
                        }
                        className={`rounded-full px-4 py-2 text-[13px] border transition-colors ${
                          isSel
                            ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--canvas)]"
                            : "border-[var(--hairline)] hover:border-[var(--ink)] text-[var(--ink)]"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* CTA */}
          <div className="mt-8">
            {canBuy ? (
              <button
                onClick={onAdd}
                className="btn-primary w-full md:w-auto px-8 py-3 text-[17px]"
              >
                Add to bag
              </button>
            ) : noPrice ? (
              <a
                href="tel:+12037609223"
                className="btn-primary w-full md:w-auto px-8 py-3 text-[17px]"
              >
                Call for pricing
              </a>
            ) : (
              <button
                disabled
                className="btn-primary w-full md:w-auto px-8 py-3 text-[17px] opacity-50 cursor-not-allowed"
              >
                Sold out
              </button>
            )}
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-4 text-[13px]">
            <Trust title="Free diagnostics" sub="Bring it in any time" />
            <Trust title="90-day warranty" sub="Covers parts & workmanship" />
            <Trust title="Same-day pickup" sub="In-store, when in stock" />
            <Trust title="Wilton, CT" sub="Or shipped nationwide" />
          </ul>

          {product.bodyHtml && (
            <div className="mt-10 border-t border-[var(--hairline)] pt-8">
              <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
                Description
              </div>
              <div
                className="mt-3 text-[15px] text-[var(--ink-muted-80)] leading-[1.6] [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_strong]:text-[var(--ink)]"
                dangerouslySetInnerHTML={{ __html: product.bodyHtml }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Trust({ title, sub }: { title: string; sub: string }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        className="mt-0.5 shrink-0 text-[var(--ink)]"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>
        <span className="font-semibold text-[var(--ink)]">{title}</span>
        <br />
        <span className="text-[var(--ink-muted-48)]">{sub}</span>
      </span>
    </li>
  );
}
