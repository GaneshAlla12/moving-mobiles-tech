import Image from "next/image";
import Link from "next/link";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { colorSwatch, isColorOptionName } from "@/lib/colors";

const MAX_VISIBLE_SWATCHES = 4;

export default function ShopProductCard({
  product,
}: {
  product: ShopifyProduct;
}) {
  const img = product.images[0];
  const hasPrice = product.price > 0;
  const showRange = product.priceMax > product.price;

  const colorOption = product.options.find((o) => isColorOptionName(o.name));
  const colors = colorOption?.values ?? [];
  const visibleColors = colors.slice(0, MAX_VISIBLE_SWATCHES);
  const hiddenCount = colors.length - visibleColors.length;

  return (
    <Link
      href={`/shop/${product.handle}`}
      className="group block overflow-hidden rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)] transition-colors hover:border-[var(--ink)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--surface)]">
        {img ? (
          <Image
            src={img.src}
            alt={img.alt || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[var(--ink-muted-48)] text-[12px]">
            No image
          </div>
        )}
        {!product.inStock && (
          <span className="absolute top-3 left-3 rounded-md bg-black/85 text-white text-[11px] font-medium px-2 py-1">
            Sold out
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-[var(--ink)] line-clamp-2 min-h-[2.6em]">
          {product.title}
        </h3>
        <div className="mt-2 text-[14px] text-[var(--ink)]">
          {hasPrice ? (
            showRange ? (
              <>
                From{" "}
                <span className="font-semibold">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-semibold">{formatPrice(product.price)}</span>
            )
          ) : (
            <span className="text-[var(--ink-muted-48)]">Contact for price</span>
          )}
        </div>

        {visibleColors.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            {visibleColors.map((c) => (
              <span
                key={c}
                aria-label={c}
                title={c}
                className="block h-4 w-4 rounded-full ring-1 ring-[var(--hairline)]"
                style={{ background: colorSwatch(c) }}
              />
            ))}
            {hiddenCount > 0 && (
              <span className="ml-1 text-[11px] text-[var(--ink-muted-48)]">
                +{hiddenCount}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
