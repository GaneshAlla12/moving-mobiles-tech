"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  { href: "/staff/appointments", label: "Appointments" },
  { href: "/repair-cost", label: "Repair cost" },
  { href: "/staff/shop", label: "Shop CMS" },
  { href: "/staff/pricing", label: "Pricing" },
  { href: "/staff/schedule", label: "Schedule" },
];

export default function Header({ isStaff = false }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = isStaff ? [...PUBLIC_NAV, ...STAFF_NAV_EXTRA] : PUBLIC_NAV;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/staff/logout", { method: "POST" });
    } catch {}
    window.location.href = "/";
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-all"
        style={{
          backgroundColor: scrolled
            ? "var(--glass-bg-strong)"
            : "var(--glass-bg)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: scrolled
            ? "1px solid var(--hairline)"
            : "1px solid transparent",
          transitionDuration: "var(--dur-3)",
          transitionTimingFunction: "var(--ease-out-expo)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 py-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={36} />
            <div className="hidden sm:block leading-tight">
              <div className="text-[14px] font-semibold tracking-[-0.01em]">
                {business.name}
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-60)]">
                {business.tagline}
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => {
              const isStaffLink =
                l.href.startsWith("/repair-cost") || l.href.startsWith("/staff/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-[13px] font-medium transition-colors hover:text-[var(--ink)] ${
                    isStaffLink
                      ? "text-[var(--ink)] flex items-center gap-1.5"
                      : "text-[var(--ink-muted-60)]"
                  }`}
                >
                  {l.label}
                  {isStaffLink && (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--primary)" }}
                      aria-label="staff route"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${business.contact.phone}`}
              className="hidden lg:inline-flex text-[13px] text-[var(--ink-muted-60)] hover:text-[var(--ink)] transition-colors px-2 tabular-nums"
              aria-label={`Call ${business.contact.phoneDisplay}`}
            >
              {business.contact.phoneDisplay}
            </a>
            <ThemeToggle />
            <CartButton />
            {isStaff && (
              <button
                onClick={onSignOut}
                disabled={signingOut}
                className="hidden sm:inline-flex rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[12px] text-[var(--ink-muted-80)] hover:border-[var(--ink-muted-32)] hover:text-[var(--ink)] transition-colors"
                title="Sign out of staff mode"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            )}
            <Link href="/book" className="btn-primary px-4 py-2 text-[14px]">
              Book
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden rounded-full border border-[var(--hairline)] p-2 text-[var(--foreground)]"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
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
          <div className="md:hidden border-t border-[var(--hairline)] glass-strong">
            <nav className="flex flex-col px-5 py-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-[16px] text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href={`tel:${business.contact.phone}`}
                className="py-3 text-[16px] text-[var(--ink-muted-60)] tabular-nums"
              >
                Call {business.contact.phoneDisplay}
              </a>
              {isStaff && (
                <button
                  onClick={onSignOut}
                  className="mt-2 self-start py-2 text-[14px] text-[var(--ink-muted-60)] hover:text-[var(--ink)]"
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
