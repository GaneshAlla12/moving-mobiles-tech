import type { Metadata } from "next";
import BookButton from "@/components/BookButton";
import MapCard from "@/components/MapCard";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit Moving Mobiles Tech at 13 Danbury Rd, Wilton, CT. Call (203) 515-5987 or book a repair appointment online.",
};

export default function Contact() {
  const a = business.contact.address;

  const items = [
    {
      label: "Address",
      content: (
        <>
          <p className="text-[17px] leading-[1.5] text-[var(--ink)]">
            {a.street}
            <br />
            {a.city}, {a.state} {a.zip}
            <br />
            {a.country}
          </p>
          <a
            href={business.contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-[15px] text-[var(--primary)] hover:underline"
          >
            Get directions →
          </a>
        </>
      ),
    },
    {
      label: "Phone",
      content: (
        <a
          href={`tel:${business.contact.phone}`}
          className="text-[19px] font-semibold tracking-[-0.011em] text-[var(--ink)] hover:text-[var(--primary)]"
        >
          {business.contact.phoneDisplay}
        </a>
      ),
    },
    {
      label: "Email",
      content: (
        <a
          href={`mailto:${business.contact.email}`}
          className="text-[19px] font-semibold tracking-[-0.011em] text-[var(--ink)] hover:text-[var(--primary)]"
        >
          {business.contact.email}
        </a>
      ),
    },
    {
      label: "Hours",
      content: (
        <p className="text-[19px] font-semibold tracking-[-0.011em] text-[var(--ink)]">
          {business.contact.hoursDisplay}
        </p>
      ),
    },
  ];

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
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((it) => (
              <div key={it.label} className="card">
                <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
                  {it.label}
                </div>
                <div className="mt-3">{it.content}</div>
              </div>
            ))}
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
