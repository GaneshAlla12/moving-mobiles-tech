"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { buildCheckoutUrl } from "@/lib/shopify";

const STORAGE_KEY = "mm-cart-v1";

export type CartLine = {
  /** Shopify variant id */
  variantId: number;
  /** Shopify product id */
  productId: number;
  productHandle: string;
  productTitle: string;
  variantTitle: string; // e.g. "Black / 256GB" or "Default"
  price: number;
  imageSrc?: string;
  quantity: number;
};

type Ctx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  removeLine: (variantId: number) => void;
  clear: () => void;
  goToCheckout: () => void;
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist on change (only after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);

  const addLine = useCallback<Ctx["addLine"]>((line) => {
    setLines((prev) => {
      const idx = prev.findIndex((p) => p.variantId === line.variantId);
      const qty = line.quantity ?? 1;
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { ...line, quantity: qty }];
    });
    setOpen(true);
  }, []);

  const setQuantity = useCallback<Ctx["setQuantity"]>((variantId, quantity) => {
    if (quantity <= 0) {
      setLines((prev) => prev.filter((l) => l.variantId !== variantId));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
    );
  }, []);

  const removeLine = useCallback<Ctx["removeLine"]>((variantId) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const goToCheckout = useCallback(() => {
    if (lines.length === 0) return;
    const url = buildCheckoutUrl(
      lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
    );
    // Open Shopify checkout in a NEW tab. If the customer cancels or
    // hits back, they simply close the tab and remain on our site —
    // their cart state is preserved in localStorage.
    const win = window.open(url, "_blank", "noopener,noreferrer");
    // If the popup was blocked, fall back to same-tab navigation so
    // the customer still gets to checkout.
    if (!win) window.location.href = url;
  }, [lines]);

  const value = useMemo<Ctx>(() => {
    const count = lines.reduce((acc, l) => acc + l.quantity, 0);
    const subtotal = lines.reduce((acc, l) => acc + l.price * l.quantity, 0);
    return {
      lines,
      count,
      subtotal,
      hydrated,
      open,
      setOpen,
      addLine,
      setQuantity,
      removeLine,
      clear,
      goToCheckout,
    };
  }, [lines, hydrated, open, addLine, setQuantity, removeLine, clear, goToCheckout]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
