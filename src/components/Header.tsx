"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { business } from "@/lib/business";
import ThemeToggle from "./ThemeToggle";
import CartButton from "./cart/CartButton";
import Logo from "./Logo";

type Props = {
  /** Whether the visitor has a valid staff cookie. Comes from layout. */
  isStaff?: boolean;
};

const PUBLIC_NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const STAFF_NAV_EXTRA = [
  { href: "/repair-cost", label: "Repair cost" },
  { href: "/staff/shop", label: "Shop CMS" },
];

export default function Header({ isStaff = false }: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const navLinks = isStaff ? [...PUBLIC_NAV, ...STAFF_NAV_EXTRA] : PUBLIC_NAV;

  const onSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/staff/logout", { method: "POST" });
    } catch {}
    // Full reload so the server-rendered Header re-evaluates the cookie.
    window.location.href = "/";
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--hairline)] bg-[var(--header-bg)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={40} />
            <div className="hidden sm:block leading-tight">
              <div className="text-[15px] font-semibold tracking-tight">
                {business.name}
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                {business.tagline}
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[13px] hover:text-[var(--primary)] transition-colors ${
                  l.href.startsWith("/repair-cost") ||
                  l.href.startsWith("/staff/")
                    ? "text-[var(--primary)] font-medium"
                    : "text-[var(--foreground)]/85"
                }`}
              >
                {l.label}
                {(l.href.startsWith("/repair-cost") ||
                  l.href.startsWith("/staff/")) && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-[var(--primary-soft)] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase text-[var(--primary)]">
                    Staff
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${business.contact.phone}`}
              className="hidden sm:inline-flex text-[13px] text-[var(--foreground)]/85 hover:text-[var(--primary)] px-2"
              aria-label={`Call ${business.contact.phoneDisplay}`}
            >
              {business.contact.phoneDisplay}
            </a>
            <ThemeToggle />
            <CartButton />
            {isStaff ? (
              <button
                onClick={onSignOut}
                disabled={signingOut}
                className="hidden sm:inline-flex rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[12px] text-[var(--ink-muted-80)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
                title="Sign out of staff mode"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            ) : null}
            <Link href="/book" className="btn-primary px-4 py-2 text-[14px]">
              Book
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden rounded-full border border-[var(--hairline)] p-2 text-[var(--foreground)]"
              aria-label="Toggle menu"
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
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--hairline)] bg-[var(--canvas-parchment)]">
            <nav className="flex flex-col px-4 py-3">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-[15px] text-[var(--foreground)]/90 hover:text-[var(--primary)]"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href={`tel:${business.contact.phone}`}
                className="py-2 text-[15px] text-[var(--foreground)]/90"
              >
                Call {business.contact.phoneDisplay}
              </a>
              {isStaff && (
                <button
                  onClick={onSignOut}
                  className="mt-1 self-start py-2 text-[14px] text-[var(--ink-muted-80)] hover:text-[var(--ink)]"
                >
                  Sign out of staff mode
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
