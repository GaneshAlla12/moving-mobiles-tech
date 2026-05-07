"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { CollectionWithProducts } from "@/lib/shopify";
import { labelFor } from "@/lib/collection-labels";
import { MAX_FEATURED, type CollectionConfig } from "@/lib/shop-config";
import { formatPrice } from "@/lib/shopify";

type Props = {
  collections: CollectionWithProducts[];
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
    [collections]
  );

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
      prev.map((it) => (it.handle === handle ? { ...it, hidden } : it))
    );
  };

  const toggleFeatured = (handle: string, productId: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.handle !== handle) return it;
        const has = it.featured.includes(productId);
        if (has) {
          return {
            ...it,
            featured: it.featured.filter((id) => id !== productId),
          };
        }
        if (it.featured.length >= MAX_FEATURED) return it;
        return { ...it, featured: [...it.featured, productId] };
      })
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
      })
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
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      setStatus({ kind: "saved", at: new Date().toLocaleTimeString() });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Save failed",
      });
    }
  };

  const visibleCount = items.filter((i) => !i.hidden).length;
  const hiddenCount = items.filter((i) => i.hidden).length;

  return (
    <div className="space-y-5">
      {/* Sticky glass toolbar */}
      <div
        className="sticky top-[72px] z-20 -mx-5 sm:mx-0 px-5 sm:px-5 py-3 flex items-center justify-between gap-4 rounded-[14px]"
        style={{
          background: "var(--glass-bg-strong)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-muted-60)]">
          <Pill color="green">{visibleCount} visible</Pill>
          {hiddenCount > 0 && <Pill color="gray">{hiddenCount} hidden</Pill>}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <button
            onClick={onSave}
            disabled={status.kind === "saving"}
            className={`btn-primary px-5 py-2 text-[13px] ${status.kind === "saving" ? "opacity-50 cursor-not-allowed" : ""}`}
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
              className="rounded-[14px] transition-all"
              style={{
                background: item.hidden
                  ? "var(--canvas-sunken)"
                  : "var(--canvas)",
                border: item.hidden
                  ? "1px dashed var(--hairline-strong)"
                  : "1px solid var(--hairline)",
                opacity: item.hidden ? 0.7 : 1,
              }}
            >
              {/* Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-1 shrink-0">
                  <ReorderButton
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    label="Move up"
                    direction="up"
                  />
                  <ReorderButton
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    label="Move down"
                    direction="down"
                  />
                </div>

                {/* Position number */}
                <div className="text-[12px] text-[var(--ink-muted-48)] tabular-nums w-7 text-center shrink-0 font-mono">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[15px] font-semibold tracking-[-0.012em] truncate ${
                        item.hidden
                          ? "text-[var(--ink-muted-48)] line-through"
                          : "text-[var(--ink)]"
                      }`}
                    >
                      {label}
                    </span>
                    {item.featured.length > 0 && (
                      <Pill color="blue">
                        {item.featured.length} featured
                      </Pill>
                    )}
                  </div>
                  <div className="text-[12px] text-[var(--ink-muted-48)] mt-0.5 tabular-nums">
                    {c.products.length} total products
                  </div>
                </div>

                {/* Visible toggle */}
                <Toggle
                  checked={!item.hidden}
                  onChange={(v) => setHidden(item.handle, !v)}
                />

                {/* Expand toggle */}
                <button
                  onClick={() => setExpanded(isOpen ? null : item.handle)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all"
                  style={{
                    background: isOpen ? "var(--ink)" : "var(--canvas-elevated)",
                    color: isOpen ? "var(--on-dark)" : "var(--ink)",
                    border: `1px solid ${isOpen ? "var(--ink)" : "var(--hairline)"}`,
                  }}
                >
                  {isOpen ? "Done" : "Pick featured"}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms var(--ease-out-expo)",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
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
          className={`btn-primary px-6 py-2.5 text-[14px] ${status.kind === "saving" ? "opacity-50 cursor-not-allowed" : ""}`}
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
      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full"
        style={{
          background: "rgba(34, 197, 94, 0.10)",
          color: "#15803d",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#22c55e" }}
        />
        Saved {status.at}
      </span>
    );
  if (status.kind === "error")
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full"
        style={{
          background: "rgba(239, 68, 68, 0.10)",
          color: "#b91c1c",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#ef4444" }}
        />
        {status.message}
      </span>
    );
  return null;
}

function Pill({
  color,
  children,
}: {
  color: "green" | "blue" | "gray";
  children: React.ReactNode;
}) {
  const palette = {
    green: { bg: "rgba(34, 197, 94, 0.10)", fg: "#15803d", dot: "#22c55e" },
    blue: { bg: "var(--primary-soft)", fg: "var(--primary)", dot: "var(--primary)" },
    gray: {
      bg: "var(--canvas-elevated)",
      fg: "var(--ink-muted-60)",
      dot: "var(--ink-muted-48)",
    },
  }[color];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
      style={{ background: palette.bg, color: palette.fg }}
    >
      <span
        className="inline-block w-1 h-1 rounded-full"
        style={{ background: palette.dot }}
      />
      {children}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="hidden sm:inline-flex shrink-0 relative w-9 h-5 rounded-full transition-colors"
      style={{
        background: checked ? "var(--primary)" : "var(--canvas-elevated)",
        border: `1px solid ${checked ? "var(--primary)" : "var(--hairline-strong)"}`,
      }}
    >
      <span
        className="absolute top-[1px] w-[15px] h-[15px] rounded-full transition-all"
        style={{
          background: "white",
          left: checked ? "calc(100% - 17px)" : "1px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
        }}
      />
    </button>
  );
}

function ReorderButton({
  onClick,
  disabled,
  label,
  direction,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  direction: "up" | "down";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-6 w-6 place-items-center rounded-md transition-all"
      style={{
        background: "var(--canvas-elevated)",
        border: "1px solid var(--hairline)",
        color: disabled ? "var(--ink-muted-32)" : "var(--ink-muted-60)",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "up" ? (
          <polyline points="18 15 12 9 6 15" />
        ) : (
          <polyline points="6 9 12 15 18 9" />
        )}
      </svg>
    </button>
  );
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
    <div
      className="border-t p-5 sm:p-6 space-y-6"
      style={{ borderColor: "var(--hairline)" }}
    >
      {/* Selected (in order) */}
      {featuredProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium">
              Selected · order shown in carousel
            </div>
            <div className="text-[11px] text-[var(--ink-muted-48)] tabular-nums">
              {featured.length} / {MAX_FEATURED} slots used
            </div>
          </div>
          <ol className="space-y-1.5">
            {featuredProducts.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors"
                style={{
                  background: "var(--canvas-elevated)",
                  border: "1px solid var(--hairline)",
                }}
              >
                <span className="text-[11px] text-[var(--ink-muted-48)] tabular-nums w-5 text-center font-mono">
                  {i + 1}
                </span>
                {p.images[0] && (
                  <span
                    className="relative h-9 w-9 shrink-0 rounded-md overflow-hidden"
                    style={{ background: "var(--canvas-sunken)" }}
                  >
                    <Image
                      src={p.images[0].src}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="flex-1 min-w-0 text-[13px] text-[var(--ink)] truncate font-medium">
                  {p.title}
                </span>
                <span className="hidden sm:inline text-[12px] text-[var(--ink-muted-48)] tabular-nums shrink-0">
                  {p.price > 0 ? formatPrice(p.price) : "—"}
                </span>
                <div className="flex gap-0.5 shrink-0">
                  <ReorderButton
                    onClick={() => onMove(i, -1)}
                    disabled={i === 0}
                    label="Move up"
                    direction="up"
                  />
                  <ReorderButton
                    onClick={() => onMove(i, 1)}
                    disabled={i === featuredProducts.length - 1}
                    label="Move down"
                    direction="down"
                  />
                  <button
                    onClick={() => onToggle(p.id)}
                    aria-label="Remove"
                    className="grid h-6 w-6 place-items-center rounded-md transition-colors"
                    style={{
                      background: "var(--canvas-elevated)",
                      border: "1px solid var(--hairline)",
                      color: "#dc2626",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* All products in this collection */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] mb-3 font-medium">
          All products · click to feature
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {collection.products.map((p) => {
            const isFeatured = featuredOrder.has(p.id);
            const atLimit = !isFeatured && featured.length >= MAX_FEATURED;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => !atLimit && onToggle(p.id)}
                disabled={atLimit}
                className="relative text-left rounded-[12px] p-2.5 transition-all"
                style={{
                  background: isFeatured
                    ? "var(--primary-soft)"
                    : atLimit
                      ? "var(--canvas-sunken)"
                      : "var(--canvas)",
                  border: `1px solid ${isFeatured ? "var(--primary)" : "var(--hairline)"}`,
                  opacity: atLimit ? 0.4 : 1,
                  cursor: atLimit ? "not-allowed" : "pointer",
                  boxShadow: isFeatured ? "var(--shadow-1)" : "none",
                }}
              >
                {p.images[0] ? (
                  <span
                    className="relative block aspect-square w-full overflow-hidden rounded-md"
                    style={{ background: "var(--canvas-sunken)" }}
                  >
                    <Image
                      src={p.images[0].src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 20vw, 50vw"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span
                    className="block aspect-square w-full rounded-md grid place-items-center text-[10px] text-[var(--ink-muted-48)]"
                    style={{ background: "var(--canvas-sunken)" }}
                  >
                    No image
                  </span>
                )}
                <div className="mt-2 text-[12px] text-[var(--ink)] line-clamp-2 leading-[1.35] font-medium">
                  {p.title}
                </div>
                {isFeatured && (
                  <span
                    className="absolute top-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold"
                    style={{
                      background: "var(--primary)",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(0, 113, 227, 0.4)",
                    }}
                  >
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
