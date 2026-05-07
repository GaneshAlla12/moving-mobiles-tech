"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { CollectionWithProducts } from "@/lib/shopify";
import { labelFor } from "@/lib/collection-labels";
import {
  MAX_FEATURED,
  type CollectionConfig,
} from "@/lib/shop-config";
import { formatPrice } from "@/lib/shopify";

type Props = {
  /** All Shopify collections (raw, used for product lists) */
  collections: CollectionWithProducts[];
  /** Initial config rows, ordered. */
  initialItems: CollectionConfig[];
};

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error"; message: string };

export default function ShopConfigEditor({
  collections,
  initialItems,
}: Props) {
  const collectionByHandle = useMemo(
    () => new Map(collections.map((c) => [c.handle, c])),
    [collections],
  );

  // Make sure we render every Shopify collection in the editor, even ones
  // not yet in the saved config (newly added since last save).
  const fullInitial = useMemo<CollectionConfig[]>(() => {
    const seen = new Set(initialItems.map((i) => i.handle));
    const padded = [...initialItems];
    for (const c of collections) {
      if (!seen.has(c.handle)) {
        padded.push({ handle: c.handle, hidden: false, featured: [] });
      }
    }
    return padded;
  }, [initialItems, collections]);

  const [items, setItems] = useState<CollectionConfig[]>(fullInitial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const move = (idx: number, delta: -1 | 1) => {
    const j = idx + delta;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
  };

  const setHidden = (handle: string, hidden: boolean) => {
    setItems((prev) =>
      prev.map((it) => (it.handle === handle ? { ...it, hidden } : it)),
    );
  };

  const toggleFeatured = (handle: string, productId: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.handle !== handle) return it;
        const has = it.featured.includes(productId);
        if (has) {
          return { ...it, featured: it.featured.filter((id) => id !== productId) };
        }
        if (it.featured.length >= MAX_FEATURED) return it;
        return { ...it, featured: [...it.featured, productId] };
      }),
    );
  };

  const moveFeatured = (handle: string, idx: number, delta: -1 | 1) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.handle !== handle) return it;
        const j = idx + delta;
        if (j < 0 || j >= it.featured.length) return it;
        const next = it.featured.slice();
        [next[idx], next[j]] = [next[j], next[idx]];
        return { ...it, featured: next };
      }),
    );
  };

  const onSave = async () => {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/staff/shop-config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ collections: items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Save failed");
      }
      setStatus({
        kind: "saved",
        at: new Date().toLocaleTimeString(),
      });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Save failed",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="sticky top-[57px] z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 flex items-center justify-between gap-3 bg-[var(--canvas)] border-b border-[var(--hairline)]">
        <div className="text-[13px] text-[var(--ink-muted-80)]">
          {items.filter((i) => !i.hidden).length} visible ·{" "}
          {items.filter((i) => i.hidden).length} hidden
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <button
            onClick={onSave}
            disabled={status.kind === "saving"}
            className={`btn-primary px-5 py-2 text-[14px] ${status.kind === "saving" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {status.kind === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {items.map((item, idx) => {
          const c = collectionByHandle.get(item.handle);
          if (!c) return null;
          const label = labelFor(item.handle, c.title);
          const isOpen = expanded === item.handle;
          return (
            <li
              key={item.handle}
              className={`rounded-[14px] border ${item.hidden ? "border-dashed border-[var(--hairline)] bg-[var(--surface)]" : "border-[var(--hairline)] bg-[var(--canvas)]"}`}
            >
              {/* Row header */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Move up/down */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Move up"
                    className={`grid h-6 w-6 place-items-center rounded border border-[var(--hairline)] text-[var(--ink-muted-80)] hover:border-[var(--ink)] hover:text-[var(--ink)] ${idx === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    aria-label="Move down"
                    className={`grid h-6 w-6 place-items-center rounded border border-[var(--hairline)] text-[var(--ink-muted-80)] hover:border-[var(--ink)] hover:text-[var(--ink)] ${idx === items.length - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* Position number */}
                <div className="text-[12px] text-[var(--ink-muted-48)] tabular-nums w-6 text-center shrink-0">
                  {idx + 1}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] font-semibold tracking-[-0.011em] truncate ${item.hidden ? "text-[var(--ink-muted-48)] line-through" : "text-[var(--ink)]"}`}>
                      {label}
                    </span>
                    {item.featured.length > 0 && (
                      <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                        {item.featured.length} featured
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[var(--ink-muted-48)]">
                    {c.products.length} total products
                  </div>
                </div>

                {/* Hidden toggle */}
                <label className="hidden sm:flex items-center gap-2 shrink-0 text-[13px] text-[var(--ink-muted-80)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!item.hidden}
                    onChange={(e) => setHidden(item.handle, !e.target.checked)}
                    className="h-4 w-4"
                  />
                  Visible
                </label>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpanded(isOpen ? null : item.handle)}
                  className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[12px] hover:border-[var(--ink)]"
                >
                  {isOpen ? "Done" : "Pick featured"}
                </button>
              </div>

              {/* Expanded — featured product picker */}
              {isOpen && (
                <FeaturedPicker
                  collection={c}
                  featured={item.featured}
                  onToggle={(id) => toggleFeatured(item.handle, id)}
                  onMove={(i, d) => moveFeatured(item.handle, i, d)}
                />
              )}

              {/* Mobile-only Visible toggle */}
              <div className="sm:hidden border-t border-[var(--hairline)] px-4 py-2 flex items-center justify-between text-[12px]">
                <label className="flex items-center gap-2 text-[var(--ink-muted-80)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!item.hidden}
                    onChange={(e) => setHidden(item.handle, !e.target.checked)}
                    className="h-4 w-4"
                  />
                  Visible on /shop
                </label>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <StatusBadge status={status} />
        <button
          onClick={onSave}
          disabled={status.kind === "saving"}
          className={`btn-primary px-6 py-2.5 text-[15px] ${status.kind === "saving" ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {status.kind === "saving" ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status.kind === "saved")
    return (
      <span className="text-[12px] text-green-600 font-medium">
        ✓ Saved at {status.at}
      </span>
    );
  if (status.kind === "error")
    return (
      <span className="text-[12px] text-red-600 font-medium">
        {status.message}
      </span>
    );
  return null;
}

function FeaturedPicker({
  collection,
  featured,
  onToggle,
  onMove,
}: {
  collection: CollectionWithProducts;
  featured: number[];
  onToggle: (id: number) => void;
  onMove: (idx: number, delta: -1 | 1) => void;
}) {
  const featuredOrder = useMemo(() => {
    const map = new Map<number, number>();
    featured.forEach((id, i) => map.set(id, i));
    return map;
  }, [featured]);

  const featuredProducts = featured
    .map((id) => collection.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="border-t border-[var(--hairline)] p-4 sm:p-5 space-y-5">
      {/* Selected (in order) */}
      {featuredProducts.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] mb-2">
            Selected — order shown in carousel
          </div>
          <ol className="space-y-1.5">
            {featuredProducts.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--canvas)] px-2 py-1.5"
              >
                <span className="text-[11px] text-[var(--ink-muted-48)] tabular-nums w-5 text-center">
                  {i + 1}
                </span>
                {p.images[0] && (
                  <span className="relative h-9 w-9 shrink-0 rounded-md overflow-hidden bg-[var(--surface)]">
                    <Image
                      src={p.images[0].src}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="flex-1 min-w-0 text-[13px] text-[var(--ink)] truncate">
                  {p.title}
                </span>
                <span className="hidden sm:inline text-[12px] text-[var(--ink-muted-48)] tabular-nums shrink-0">
                  {p.price > 0 ? formatPrice(p.price) : "—"}
                </span>
                <div className="flex gap-0.5 shrink-0">
                  <button
                    onClick={() => onMove(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className={`grid h-6 w-6 place-items-center rounded border border-[var(--hairline)] hover:border-[var(--ink)] ${i === 0 ? "opacity-30" : ""}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
                  </button>
                  <button
                    onClick={() => onMove(i, 1)}
                    disabled={i === featuredProducts.length - 1}
                    aria-label="Move down"
                    className={`grid h-6 w-6 place-items-center rounded border border-[var(--hairline)] hover:border-[var(--ink)] ${i === featuredProducts.length - 1 ? "opacity-30" : ""}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  <button
                    onClick={() => onToggle(p.id)}
                    aria-label="Remove"
                    className="grid h-6 w-6 place-items-center rounded border border-[var(--hairline)] text-red-600 hover:border-red-600"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-2 text-[11px] text-[var(--ink-muted-48)]">
            {featured.length} of {MAX_FEATURED} slots used
          </div>
        </div>
      )}

      {/* All products in this collection */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] mb-2">
          All products in this collection — click to feature
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {collection.products.map((p) => {
            const isFeatured = featuredOrder.has(p.id);
            const atLimit =
              !isFeatured && featured.length >= MAX_FEATURED;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => !atLimit && onToggle(p.id)}
                disabled={atLimit}
                className={`relative text-left rounded-[10px] border p-2 transition-colors ${
                  isFeatured
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : atLimit
                      ? "border-[var(--hairline)] bg-[var(--surface)] opacity-50 cursor-not-allowed"
                      : "border-[var(--hairline)] bg-[var(--canvas)] hover:border-[var(--ink)]"
                }`}
              >
                {p.images[0] ? (
                  <span className="relative block aspect-square w-full overflow-hidden rounded bg-[var(--surface)]">
                    <Image
                      src={p.images[0].src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 20vw, 50vw"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="block aspect-square w-full rounded bg-[var(--surface)] grid place-items-center text-[10px] text-[var(--ink-muted-48)]">
                    No image
                  </span>
                )}
                <div className="mt-1.5 text-[12px] text-[var(--ink)] line-clamp-2 leading-[1.3]">
                  {p.title}
                </div>
                {isFeatured && (
                  <span className="absolute top-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-[var(--primary)] text-white text-[10px] font-bold">
                    {featuredOrder.get(p.id)! + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
