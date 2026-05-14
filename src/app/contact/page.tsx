import type { Metadata } from "next";
import BookButton from "@/components/BookButton";
import MapCard from "@/components/MapCard";
import { business } from "@/lib/business";
import StoreHoursCard from "@/components/StoreHoursCard";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit Moving Mobiles Tech at 13 Danbury Rd, Wilton, CT. Call (203) 760-9223 or book a repair appointment online.",
};

export default function Contact() {
  const a = business.contact.address;

  return (
    <>
      <section className="tile-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-10">
          <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
            Contact
          </div>
          <h1
            className="mt-3 font-semibold leading-[1.07] tracking-[-0.005em]"
            style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            Drop in, call, or book online.
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
            Walk-ins are welcome, but booking guarantees a tech is ready for
            you when you arrive.
          </p>
        </div>
      </section>

      <section className="tile-parchment">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 section-pad">

          {/* Top row: Address (wide) + Phone */}
          <div className="grid gap-4 sm:grid-cols-5">

            {/* Address — spans 3 cols */}
            <a
              href={business.contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group sm:col-span-3 card flex flex-col gap-4 no-underline"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: "var(--primary-soft)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span
                  className="text-[12px] font-semibold tracking-[0.04em] transition-colors"
                  style={{ color: "var(--primary)" }}
                >
                  Get directions →
                </span>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] mb-2">
                  Address
                </div>
                <p className="text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-[var(--ink)]">
                  {a.street}
                  <br />
                  <span className="text-[var(--ink-muted-80)]">
                    {a.city}, {a.state} {a.zip}
                  </span>
                </p>
              </div>
            </a>

            {/* Phone — spans 2 cols */}
            <a
              href={`tel:${business.contact.phone}`}
              className="group sm:col-span-2 card flex flex-col justify-between gap-4 no-underline"
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: "var(--primary-soft)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.9a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] mb-2">
                  Phone
                </div>
                <p className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
                  {business.contact.phoneDisplay}
                </p>
                <p className="mt-1 text-[12px] text-[var(--ink-muted-60)]">
                  Tap to call
                </p>
              </div>
            </a>
          </div>

          {/* Bottom row: Email + Hours */}
          <div className="grid gap-4 sm:grid-cols-5 mt-4">

            {/* Email — spans 2 cols */}
            <a
              href={`mailto:${business.contact.email}`}
              className="group sm:col-span-2 card flex flex-col justify-between gap-4 no-underline"
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: "var(--primary-soft)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] mb-2">
                  Email
                </div>
                <p className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors break-all">
                  {business.contact.email}
                </p>
                <p className="mt-1 text-[12px] text-[var(--ink-muted-60)]">
                  We reply within a few hours
                </p>
              </div>
            </a>

            {/* Hours — spans 3 cols */}
            <div className="sm:col-span-3 card">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: "var(--primary-soft)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
                  Hours
                </div>
              </div>
              <StoreHoursCard />
            </div>
          </div>

          <div className="mt-8">
            <MapCard />
          </div>

          <div className="mt-12 flex justify-center">
            <BookButton size="lg" />
          </div>
        </div>
      </section>
    </>
  );
}
