import Image from "next/image";
import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/Reveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import StickyProcess from "@/components/StickyProcess";
import PromoCarousel from "@/components/PromoCarousel";
import { services } from "@/lib/services";
import { business } from "@/lib/business";

const featuredSlugs = [
  "iphone-repair",
  "battery-replacement",
  "charging-port-repair",
  "water-damage-repair",
  "motherboard-repair",
  "tablet-repair",
];

export default function Home() {
  const featured = featuredSlugs
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      {/* Hero — full-bleed, monochrome, dramatic */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        <div className="hero-vignette absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-[1.04]"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 min-h-[clamp(620px,88vh,1100px)] flex flex-col justify-end pb-10 md:pb-20 pt-28">
          <Reveal>
            <div className="inline-flex items-center gap-2.5 text-[12px] font-medium text-white/75">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}
              />
              <span className="tabular-nums">
                Now serving Wilton & Norwalk, CT
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1
              className="mt-6 max-w-5xl font-semibold leading-[0.94] tracking-[-0.025em] text-white"
              style={{ fontSize: "clamp(56px, 11vw, 160px)" }}
            >
              Bring it back<br className="hidden sm:block" /> to life.
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p
              className="mt-7 max-w-xl text-white/75"
              style={{
                fontSize: "clamp(17px, 1.6vw, 21px)",
                lineHeight: 1.45,
                letterSpacing: "-0.011em",
              }}
            >
              Same-day phone, tablet, and laptop repair from the team trusted by{" "}
              <span className="text-white tabular-nums">
                <AnimatedCounter to={business.rating.count} duration={1400} />+
              </span>{" "}
              five-star reviewers across Connecticut.
            </p>
          </Reveal>

          <Reveal delay={360} className="mt-10">
            <div className="flex flex-wrap items-center gap-3">
              <BookButton size="lg" />
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 backdrop-blur-md px-7 py-3.5 text-[15px] font-medium text-white hover:bg-white/12 hover:border-white/40 transition-all"
              >
                Browse the shop
              </Link>
              <a
                href={`tel:${business.contact.phone}`}
                className="text-[14px] text-white/60 hover:text-white transition-colors ml-2 tabular-nums"
              >
                or call {business.contact.phoneDisplay}
              </a>
            </div>
          </Reveal>

          {/* Promo carousel */}
          <Reveal delay={480} className="mt-12 w-full">
            <PromoCarousel />
          </Reveal>
        </div>

        {/* Scroll cue */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 z-20 flex flex-col items-center text-white/50">
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <svg
            className="mt-1.5 scroll-cue"
            width="14"
            height="20"
            viewBox="0 0 18 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="9" y1="3" x2="9" y2="17" />
            <polyline points="3 11 9 17 15 11" />
          </svg>
        </div>
      </section>

      {/* Trust strip — refined animated counters */}
      <section className="tile-light border-b border-[var(--hairline)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="eyebrow">Trusted across Connecticut</div>
              <h2 className="mt-4 h-display-md">
                The numbers do the talking.
              </h2>
            </div>
          </Reveal>
          <Reveal stagger className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            <Stat
              big={
                <AnimatedCounter
                  to={business.rating.score}
                  decimals={1}
                  duration={1200}
                />
              }
              suffix="★"
              label="Google rating"
            />
            <Stat
              big={
                <AnimatedCounter to={business.rating.count} duration={1400} />
              }
              suffix="+"
              label="Five-star reviews"
            />
            <Stat
              big={<AnimatedCounter to={90} duration={1500} />}
              suffix="-day"
              label="Warranty"
            />
            <Stat big="Same" suffix="-day" label="Most repairs" />
          </Reveal>
        </div>
      </section>

      {/* Featured services — dark tile, monochrome */}
      <section className="tile-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-grid pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 section-pad">
          <Reveal>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div className="max-w-2xl">
                <div className="eyebrow text-white/55">What we fix</div>
                <h2 className="mt-4 h-display-xl text-white">
                  Repair, restored.
                </h2>
                <p className="mt-6 max-w-lg text-[17px] text-white/65 leading-[1.55]">
                  From cracked screens to motherboard-level micro-soldering — if
                  it&apos;s broken, it&apos;s our problem.
                </p>
              </div>
              <Link
                href="/services"
                className="text-link text-[15px] text-white"
              >
                View all 19 services →
              </Link>
            </div>
          </Reveal>
          <Reveal stagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* Sticky-scroll how it works */}
      <StickyProcess />

      {/* Visit the shop */}
      <section className="tile-canvas border-t border-[var(--hairline)]">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 section-pad text-center">
          <Reveal>
            <div className="eyebrow">Visit the shop</div>
            <h2 className="mt-4 h-display-lg">
              {business.contact.address.city},{" "}
              {business.contact.address.state}.
            </h2>
            <p className="mt-6 max-w-lg mx-auto text-[17px] text-[var(--ink-muted-60)] leading-[1.55]">
              We&apos;re a short drive from Norwalk, Stamford, Ridgefield, and
              Danbury. Walk-ins welcome — but booking guarantees a tech is ready
              for you.
            </p>
            <address className="mt-8 not-italic text-[16px] text-[var(--ink)] leading-[1.6]">
              {business.contact.address.street},{" "}
              {business.contact.address.city}, {business.contact.address.state}{" "}
              {business.contact.address.zip}
              <br />
              <span className="text-[var(--ink-muted-48)]">
                {business.contact.hoursDisplay}
              </span>
            </address>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href={`tel:${business.contact.phone}`}
                className="btn-primary px-6 py-3 text-[15px]"
              >
                Call {business.contact.phoneDisplay}
              </a>
              <a
                href={business.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3 text-[15px]"
              >
                Get directions
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA — full-bleed, dramatic */}
      <section className="tile-dark">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 section-pad text-center">
          <Reveal>
            <div className="eyebrow text-white/55">Get started</div>
            <h2 className="mt-4 h-display-xl text-white">
              Ready when you are.
            </h2>
            <p className="mt-6 text-[19px] text-white/65 leading-[1.5] max-w-xl mx-auto">
              Book a repair slot in under 60 seconds. Most appointments
              available the same day.
            </p>
            <div className="mt-10 flex justify-center">
              <BookButton size="lg" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Stat({
  big,
  suffix,
  label,
}: {
  big: React.ReactNode;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="font-semibold tracking-[-0.025em] text-[var(--ink)] tabular-nums">
        <span style={{ fontSize: "clamp(48px, 6vw, 84px)", lineHeight: 1 }}>
          {big}
        </span>
        {suffix && (
          <span className="text-[var(--ink-muted-32)] text-[28px] ml-1 align-top">
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-3 text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-60)] font-medium">
        {label}
      </div>
    </div>
  );
}
