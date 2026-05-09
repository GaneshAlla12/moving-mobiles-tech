"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { business } from "@/lib/business";
import ThemeToggle from "./ThemeToggle";
import CartButton from "./cart/CartButton";
import Logo from "./Logo";

type Props = {
  /** Whether the visitor has a valid staff cookie. Comes from layout. */
  isStaff?: boolean;
  /** Identified employee name, if any. null = manager / not yet identified. */
  staffName?: string | null;
};

const EMPLOYEE_HUE: Record<string, string> = {
  Satya: "#0071e3",
  Niteesh: "#8b5cf6",
  Bharath: "#10b981",
  Trainee: "#f59e0b",
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || name.slice(0, 2).toUpperCase();

const PUBLIC_NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const STAFF_NAV_EXTRA = [
  { href: "/staff/appointments", label: "Appointments", desc: "Live from Cal.com" },
  { href: "/staff/attendance", label: "Time clock", desc: "Sign in / sign out tracking" },
  { href: "/staff/schedule", label: "Schedule", desc: "Weekly staff shifts" },
  { href: "/staff/shop", label: "Shop CMS", desc: "Carousel order + featured" },
  { href: "/staff/pricing", label: "Pricing", desc: "Repair cost overrides" },
  { href: "/repair-cost", label: "Repair cost", desc: "Public estimator" },
];

export default function Header({ isStaff = false, staffName = null }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const staffRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close staff menu on route change or outside click
  useEffect(() => {
    setStaffOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!staffOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!staffRef.current?.contains(e.target as Node)) setStaffOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStaffOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [staffOpen]);

  const isStaffRoute =
    pathname?.startsWith("/staff/") || pathname?.startsWith("/repair-cost");

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
    // After clock-out, return to the staff sign-in page so the next
    // person can sign in directly. Customer-side users never see a
    // sign-out button, so this is always a staff context.
    window.location.href = "/staff";
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
            {PUBLIC_NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] font-medium text-[var(--ink-muted-60)] hover:text-[var(--ink)] transition-colors"
              >
                {l.label}
              </Link>
            ))}

            {isStaff && (
              <div ref={staffRef} className="relative">
                <button
                  onClick={() => setStaffOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={staffOpen}
                  className="text-[13px] font-medium transition-colors flex items-center gap-1.5"
                  style={{
                    color: isStaffRoute || staffOpen
                      ? "var(--ink)"
                      : "var(--ink-muted-60)",
                  }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--primary)" }}
                    aria-hidden="true"
                  />
                  Staff
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: staffOpen ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 200ms var(--ease-out-expo)",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {staffOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 min-w-[260px] rounded-[14px] p-1.5 z-50"
                    style={{
                      background: "var(--canvas)",
                      border: "1px solid var(--hairline-strong)",
                      boxShadow: "var(--shadow-3)",
                    }}
                  >
                    {STAFF_NAV_EXTRA.map((l) => {
                      const active = pathname === l.href;
                      return (
                        <Link
                          key={l.href}
                          href={l.href}
                          role="menuitem"
                          onClick={() => setStaffOpen(false)}
                          className="flex items-start gap-3 rounded-[10px] px-3 py-2.5 transition-colors"
                          style={{
                            background: active
                              ? "var(--primary-soft)"
                              : "transparent",
                          }}
                        >
                          <span className="flex-1 min-w-0">
                            <span
                              className="block text-[13px] font-semibold"
                              style={{
                                color: active
                                  ? "var(--primary)"
                                  : "var(--ink)",
                              }}
                            >
                              {l.label}
                            </span>
                            <span className="block text-[11px] text-[var(--ink-muted-60)] mt-0.5">
                              {l.desc}
                            </span>
                          </span>
                          {active && (
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                              style={{ background: "var(--primary)" }}
                              aria-hidden="true"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {!isStaff && (
              <a
                href={`tel:${business.contact.phone}`}
                className="hidden lg:inline-flex text-[13px] text-[var(--ink-muted-60)] hover:text-[var(--ink)] transition-colors px-2 tabular-nums"
                aria-label={`Call ${business.contact.phoneDisplay}`}
              >
                {business.contact.phoneDisplay}
              </a>
            )}
            <ThemeToggle />
            <CartButton />
            {isStaff && staffName && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1 text-[12px] font-semibold tabular-nums"
                style={{
                  background: "var(--canvas-elevated)",
                  border: "1px solid var(--hairline)",
                  color: "var(--ink)",
                }}
                title={`Signed in as ${staffName}`}
              >
                <span
                  className="grid place-items-center rounded-full text-white font-semibold"
                  style={{
                    width: 22,
                    height: 22,
                    fontSize: 10,
                    background:
                      EMPLOYEE_HUE[staffName]
                        ? `linear-gradient(135deg, ${EMPLOYEE_HUE[staffName]} 0%, ${EMPLOYEE_HUE[staffName]}cc 100%)`
                        : "var(--ink)",
                  }}
                  aria-hidden="true"
                >
                  {initialsOf(staffName)}
                </span>
                {staffName}
              </span>
            )}
            {isStaff && (
              <button
                onClick={onSignOut}
                disabled={signingOut}
                className="hidden sm:inline-flex rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[12px] text-[var(--ink-muted-80)] hover:border-[var(--ink-muted-32)] hover:text-[var(--ink)] transition-colors"
                title={
                  staffName
                    ? `Sign out of ${staffName} (clocks you out)`
                    : "Sign out of staff mode"
                }
              >
                {signingOut
                  ? "Signing out…"
                  : staffName
                    ? "Clock out"
                    : "Sign out"}
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
          <div
            className="md:hidden border-t border-[var(--hairline)]"
            style={{ background: "var(--canvas)" }}
          >
            <nav className="flex flex-col px-5 py-4">
              {PUBLIC_NAV.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-[16px] text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              {isStaff && (
                <>
                  <div className="mt-3 pt-3 border-t border-[var(--hairline)] text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium flex items-center gap-2">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--primary)" }}
                    />
                    Staff
                  </div>
                  {STAFF_NAV_EXTRA.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 text-[15px] text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </>
              )}
              <a
                href={`tel:${business.contact.phone}`}
                className="mt-3 pt-3 border-t border-[var(--hairline)] py-3 text-[16px] text-[var(--ink-muted-60)] tabular-nums"
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
