"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { formatPrice, SHOPIFY_DOMAIN } from "@/lib/shopify";

export default function CartDrawer() {
  const { lines, open, setOpen, setQuantity, removeLine, subtotal, goToCheckout } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[var(--canvas)] border-l border-[var(--hairline)] flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hairline)]">
          <div>
            <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
              Your bag
            </div>
            <div className="text-[19px] font-semibold tracking-[-0.011em]">
              {lines.length === 0
                ? "Empty"
                : `${lines.reduce((a, l) => a + l.quantity, 0)} ${
                    lines.reduce((a, l) => a + l.quantity, 0) === 1
                      ? "item"
                      : "items"
                  }`}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="rounded-full p-2 text-[var(--ink-muted-48)] hover:text-[var(--ink)] hover:bg-[var(--surface)]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="p-8 text-center">
              <div className="grid mx-auto h-14 w-14 place-items-center rounded-full bg-[var(--surface)] text-[var(--ink-muted-48)]">
                <BagIcon />
              </div>
              <p className="mt-5 text-[15px] text-[var(--ink-muted-80)]">
                Nothing in your bag yet.
              </p>
              <p className="mt-1 text-[13px] text-[var(--ink-muted-48)]">
                Browse the shop to find something you love.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {lines.map((l) => (
                <li key={l.variantId} className="p-5 flex gap-4">
                  <div className="relative w-20 h-20 shrink-0 rounded-[12px] overflow-hidden bg-[var(--surface)]">
                    {l.imageSrc ? (
                      <Image
                        src={l.imageSrc}
                        alt={l.productTitle}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={`/shop/${l.productHandle}`}
                        className="text-[14px] font-semibold tracking-[-0.011em] text-[var(--ink)] hover:text-[var(--primary)] line-clamp-2"
                      >
                        {l.productTitle}
                      </a>
                      <button
                        onClick={() => removeLine(l.variantId)}
                        aria-label="Remove item"
                        className="text-[var(--ink-muted-48)] hover:text-[var(--ink)] shrink-0"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    {l.variantTitle && l.variantTitle !== "Default Title" && (
                      <div className="mt-0.5 text-[12px] text-[var(--ink-muted-48)]">
                        {l.variantTitle}
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-[var(--hairline)]">
                        <button
                          onClick={() =>
                            setQuantity(l.variantId, l.quantity - 1)
                          }
                          aria-label="Decrease"
                          className="px-3 py-1 text-[var(--ink-muted-80)] hover:text-[var(--ink)]"
                        >
                          –
                        </button>
                        <span className="px-2 text-[14px] tabular-nums">
                          {l.quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(l.variantId, l.quantity + 1)
                          }
                          aria-label="Increase"
                          className="px-3 py-1 text-[var(--ink-muted-80)] hover:text-[var(--ink)]"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[14px] font-semibold tabular-nums">
                        {formatPrice(l.price * l.quantity)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-[var(--hairline)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[var(--ink-muted-80)]">
                Subtotal
              </span>
              <span className="text-[19px] font-semibold tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--ink-muted-48)]">
              Shipping &amp; taxes calculated at checkout.
            </p>
            <button
              onClick={goToCheckout}
              className="btn-primary mt-4 w-full px-5 py-3 text-[15px]"
            >
              Checkout securely on Shopify
            </button>
            <p className="mt-3 text-center text-[11px] text-[var(--ink-muted-48)] flex items-center justify-center gap-1">
              <LockIcon /> Secure checkout via {SHOPIFY_DOMAIN}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

function BagIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
