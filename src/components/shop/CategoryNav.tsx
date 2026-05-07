"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CollectionWithProducts } from "@/lib/shopify";

// Top-level groups → list of dropdown entries. Each entry has a Shopify
// collection handle and an optional `label` override (useful when the
// Shopify collection name has a typo or you want a cleaner display name).
// Handles that don't exist in the live store are silently skipped.
type GroupItem = { handle: string; label?: string };
const GROUPS: { label: string; items: GroupItem[] }[] = [
  {
    label: "Phones",
    items: [
      { handle: "apple-products-1", label: "Apple" },
      { handle: "samsung", label: "Samsung" },
    ],
  },
  {
    label: "Watches",
    items: [
      { handle: "apple-watches", label: "Apple Watches" },
      { handle: "samsung-watches", label: "Samsung Watches" },
    ],
  },
  {
    label: "Audio",
    items: [
      { handle: "apple-airpods", label: "Apple AirPods" },
      { handle: "ear-phones-headphones-1", label: "Earphones & Headphones" },
      { handle: "ear-phones-headphones", label: "Mics" },
    ],
  },
  {
    label: "Gaming",
    items: [
      { handle: "playstation", label: "PlayStation" },
      { handle: "xbox", label: "Xbox" },
    ],
  },
  {
    label: "Charging",
    items: [
      { handle: "cables-adapters", label: "Cables & Adapters" },
      { handle: "power-bank", label: "Power Banks" },
      { handle: "wall-laptop-charger", label: "Wall & Laptop Chargers" },
      { handle: "wireless-charging", label: "Wireless Charging" },
    ],
  },
  {
    label: "Accessories",
    items: [
      { handle: "kayboard-mouse", label: "Keyboard & Mouse" },
      { handle: "stands-gimbals", label: "Stands & Gimbals" },
      { handle: "storage-devices-hubs", label: "Storage Devices & Hubs" },
      { handle: "apple-watch-straps", label: "Apple Watch Straps" },
      { handle: "iphone-cases", label: "iPhone Cases" },
      { handle: "samsung-case", label: "Samsung Cases" },
    ],
  },
  {
    label: "Repair",
    items: [
      { handle: "repair-services", label: "Repair Services" },
      { handle: "in-store-repairs", label: "Electronics Repairs A–Z" },
    ],
  },
];

export default function CategoryNav({
  collections,
}: {
  collections: CollectionWithProducts[];
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel any pending close (used when cursor re-enters button or dropdown)
  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  // Schedule close after a short grace period — gives the cursor time
  // to travel from button to dropdown panel without closing.
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpenIdx(null), 200);
  }, [cancelClose]);

  // Close on outside click + Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpenIdx(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Clean up the timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  type DropdownItem = {
    handle: string;
    label: string;
    products: CollectionWithProducts["products"];
  };
  const groups = GROUPS.map((g) => ({
    label: g.label,
    items: g.items
      .map((it): DropdownItem | null => {
        const c = byHandle.get(it.handle);
        if (!c) return null;
        return {
          handle: c.handle,
          label: it.label ?? c.title,
          products: c.products,
        };
      })
      .filter((x): x is DropdownItem => x !== null),
  })).filter((g) => g.items.length > 0);

  const scrollToSection = (handle: string) => {
    setOpenIdx(null);
    const el = document.getElementById(handle);
    if (!el) return;
    const headerOffset = 80;
    const top =
      el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div ref={navRef}>
      {/* Bar */}
      <nav
        aria-label="Shop categories"
        className="overflow-x-auto sm:overflow-visible -mx-4 sm:mx-0 px-4 sm:px-0 border-y border-[var(--hairline)] bg-[var(--canvas)]"
      >
        <ul className="flex justify-start sm:justify-center gap-1 min-w-max sm:min-w-0">
          {groups.map((g, i) => {
            const isOpen = openIdx === i;
            const isSingle = g.items.length === 1;
            const onlyHandle = isSingle ? g.items[0].handle : undefined;
            return (
              <li
                key={g.label}
                className="relative"
                onMouseEnter={() => {
                  if (!isSingle) {
                    cancelClose();
                    setOpenIdx(i);
                  }
                }}
                onMouseLeave={() => {
                  if (!isSingle) scheduleClose();
                }}
              >
                <button
                  type="button"
                  aria-haspopup={!isSingle}
                  aria-expanded={isOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSingle && onlyHandle) {
                      scrollToSection(onlyHandle);
                      return;
                    }
                    cancelClose();
                    setOpenIdx(isOpen ? null : i);
                  }}
                  className={`flex items-center gap-1 px-4 py-3.5 text-[14px] font-medium tracking-[-0.011em] transition-colors ${
                    isOpen
                      ? "text-[var(--primary)]"
                      : "text-[var(--ink)] hover:text-[var(--primary)]"
                  }`}
                >
                  {g.label}
                  {!isSingle && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </button>

                {/* Dropdown anchored to THIS button. The pt-2 inside the
                    panel acts as a hover-bridge: visually there's a gap from
                    the button, but the dropdown element itself touches the
                    button so the cursor never leaves the hoverable area. */}
                {isOpen && !isSingle && (
                  <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    className="absolute left-0 top-full z-30 pt-2"
                  >
                    <div className="rounded-[14px] border border-[var(--hairline)] bg-[var(--canvas)] shadow-lg shadow-black/5 min-w-[240px] py-2">
                      <ul>
                        {g.items.map((c) => (
                          <li key={c.handle}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                scrollToSection(c.handle);
                              }}
                              className="block w-full px-5 py-2.5 text-left text-[14px] text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
                            >
                              {c.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
