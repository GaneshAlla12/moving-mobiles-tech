import Link from "next/link";
import { business } from "@/lib/business";
import Logo from "./Logo";

export default function Footer() {
  const a = business.contact.address;
  return (
    <footer className="mt-24 bg-[var(--canvas-sunken)] text-[var(--ink-muted-80)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4 text-[13px] leading-[1.6]">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <Logo size={40} />
              <div className="leading-tight">
                <div className="text-[14px] font-semibold text-[var(--foreground)]">
                  {business.name}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  {business.tagline}
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-[var(--ink-muted-48)]">
              {business.founded}. Trusted by 80+ five-star reviewers across
              Connecticut.
            </p>
          </div>

          <div>
            <div className="text-[12px] font-semibold text-[var(--foreground)] mb-3">
              Visit
            </div>
            <a
              href={business.contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="not-italic text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
            >
              {a.street}
              <br />
              {a.city}, {a.state} {a.zip}
              <br />
              {a.country}
            </a>
          </div>

          <div>
            <div className="text-[12px] font-semibold text-[var(--foreground)] mb-3">
              Contact
            </div>
            <ul className="space-y-1.5">
              <li>
                <a
                  href={`tel:${business.contact.phone}`}
                  className="text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
                >
                  {business.contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.contact.email}`}
                  className="text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
                >
                  {business.contact.email}
                </a>
              </li>
              <li className="text-[var(--ink-muted-48)]">
                {business.contact.hoursDisplay}
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[12px] font-semibold text-[var(--foreground)] mb-3">
              Explore
            </div>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/services"
                  className="text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
                >
                  All services
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--hairline)] flex flex-col sm:flex-row justify-between gap-2 text-[12px] text-[var(--ink-muted-48)]">
          <span>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </span>
          <a
            href={business.contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--ink)] transition-colors"
          >
            ★ {business.rating.score} · {business.rating.count} Google reviews
          </a>
        </div>
      </div>
    </footer>
  );
}
