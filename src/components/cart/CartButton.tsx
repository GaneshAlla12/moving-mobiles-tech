"use client";

import { useCart } from "./CartProvider";

export default function CartButton() {
  const { count, setOpen, hydrated } = useCart();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label={`Open cart${count > 0 ? `, ${count} items` : ""}`}
      className="relative rounded-full p-2 text-[var(--foreground)]/80 hover:text-[var(--primary)] hover:border-[var(--primary)] border border-[var(--border)] transition-colors"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 7h12l-1 13H7L6 7z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>
      {hydrated && count > 0 && (
        <span className="absolute -top-1 -right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[var(--primary)] text-white text-[10px] font-semibold tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
