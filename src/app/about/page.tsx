import type { Metadata } from "next";
import BookButton from "@/components/BookButton";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "About",
  description:
    "Moving Mobiles Tech is a Wilton, CT mobile repair shop founded in Danbury — combining quality parts with honest service since day one.",
};

export default function About() {
  return (
    <>
      <section className="tile-light">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-10">
          <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
            About us
          </div>
          <h1
            className="mt-3 font-semibold leading-[1.07] tracking-[-0.005em]"
            style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            Quality, affordability, trust.
          </h1>
        </div>
      </section>

      <section className="tile-light">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-20 space-y-8">
          <p className="text-[19px] text-[var(--ink-muted-80)] leading-[1.5]">
            At {business.name}, our mission is to provide an unparalleled mobile
            experience where quality meets affordability. We specialize in expert
            repair services for phones, tablets, laptops, and audio gear —
            handling everything from cracked screens to motherboard-level
            micro-soldering.
          </p>
          <p className="text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
            Our commitment goes beyond the repair bench. We also offer buy-back
            programs and a curated selection of refurbished and new devices,
            designed to help our community manage their tech without the markup
            of big-box retailers.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 pt-4">
            {[
              { k: business.rating.score, l: "Google rating" },
              { k: `${business.rating.count}+`, l: "Five-star reviews" },
              { k: "Same-day", l: "Most repairs" },
            ].map((s) => (
              <div key={s.l} className="card text-center">
                <div className="text-[34px] font-semibold tracking-[-0.011em] text-[var(--primary)]">
                  {s.k}
                </div>
                <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] mt-2">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tile-parchment">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 section-pad">
          <h2
            className="font-semibold leading-[1.1] tracking-[-0.005em]"
            style={{ fontSize: "clamp(24px, 3vw, 34px)" }}
          >
            Our journey
          </h2>
          <p className="mt-4 text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
            Moving Mobiles started as a vision to create a trusted haven for
            mobile users. {business.founded}, we&apos;ve grown by combining a
            passion for technology with a clear understanding of what real
            customer service looks like — show up, do the work right, stand
            behind it.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <a
              href={`mailto:${business.contact.email}`}
              className="rounded-[14px] border border-[var(--hairline)] bg-[var(--canvas)] p-5 hover:border-[var(--ink)] transition-colors"
            >
              <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
                Email
              </div>
              <div className="mt-1.5 text-[17px] font-semibold tracking-[-0.011em] text-[var(--ink)] break-all">
                {business.contact.email}
              </div>
            </a>
            <a
              href={`tel:${business.contact.phone}`}
              className="rounded-[14px] border border-[var(--hairline)] bg-[var(--canvas)] p-5 hover:border-[var(--ink)] transition-colors"
            >
              <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
                Phone
              </div>
              <div className="mt-1.5 text-[17px] font-semibold tracking-[-0.011em] text-[var(--ink)]">
                {business.contact.phoneDisplay}
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="tile-dark">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 section-pad text-center">
          <h2
            className="font-semibold leading-[1.1] tracking-[-0.005em]"
            style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
          >
            Got a broken device? We can probably fix it.
          </h2>
          <div className="mt-7 flex justify-center">
            <BookButton size="lg" />
          </div>
        </div>
      </section>
    </>
  );
}
