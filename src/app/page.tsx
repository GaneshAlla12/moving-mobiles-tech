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
      {/* Cinematic hero — full-bleed photography, dark */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        <div className="hero-vignette absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 min-h-[640px] md:min-h-[760px] flex flex-col justify-end pb-16 md:pb-24">
          <Reveal>
            <div className="inline-flex items-center gap-2 text-[13px] tracking-[-0.011em]">
              <span className="text-[#2997ff] font-semibold">
                ★{" "}
                <AnimatedCounter
                  to={business.rating.score}
                  decimals={1}
                  duration={1200}
                />
              </span>
              <span className="text-white/70">
                <AnimatedCounter
                  to={business.rating.count}
                  duration={1400}
                />{" "}
                Google reviews · Wilton, CT
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1
              className="mt-5 max-w-4xl font-semibold leading-[0.96] tracking-[-0.012em]"
              style={{ fontSize: "clamp(48px, 9vw, 120px)" }}
            >
              Bring it back<br className="hidden sm:block" /> to life.
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p
              className="mt-6 max-w-xl text-white/80"
              style={{ fontSize: "clamp(17px, 2vw, 21px)", lineHeight: 1.5 }}
            >
              Same-day phone, tablet, and laptop repair from the team trusted by
              80+ five-star reviewers across Connecticut.
            </p>
          </Reveal>

          <Reveal delay={360} className="mt-9">
            <div className="flex flex-wrap items-center gap-3">
              <BookButton size="lg" />
              <Link
                href="/shop"
                className="rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-7 py-3 text-[17px] text-white hover:bg-white/15 transition-colors"
              >
                Browse the shop
              </Link>
              <a
                href={`tel:${business.contact.phone}`}
                className="text-[14px] text-white/70 hover:text-white ml-1"
              >
                or call {business.contact.phoneDisplay}
              </a>
            </div>
          </Reveal>

          {/* Promo carousel */}
          <Reveal delay={480} className="mt-10 w-full">
            <PromoCarousel />
          </Reveal>

          {/* Scroll cue */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex flex-col items-center text-white/60">
            <span className="text-[10px] uppercase tracking-[0.18em]">
              Scroll
            </span>
            <svg
              className="mt-1 scroll-cue"
              width="18"
              height="22"
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
        </div>
      </section>

      {/* Animated stats strip */}
      <section className="tile-light border-b border-[var(--hairline)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <Reveal stagger className="grid grid-cols-2 sm:grid-cols-4 gap-8">
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
                <AnimatedCounter
                  to={business.rating.count}
                  duration={1400}
                />
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

      {/* Featured services — dark tile with photography-first cards */}
      <section className="tile-dark">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 section-pad">
          <Reveal>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary-on-dark)]">
                  What we fix
                </div>
                <h2
                  className="mt-2 font-semibold leading-[1.02] tracking-[-0.008em] max-w-3xl"
                  style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
                >
                  Repair, restored.
                </h2>
                <p className="mt-5 max-w-xl text-[17px] text-white/70 leading-[1.5]">
                  From cracked screens to motherboard-level micro-soldering — if
                  it&apos;s broken, it&apos;s our problem.
                </p>
              </div>
              <Link
                href="/services"
                className="text-[15px] text-[var(--primary-on-dark)] hover:underline"
              >
                View all 19 services →
              </Link>
            </div>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* Sticky-scroll how it works */}
      <StickyProcess />

      {/* Visit the shop */}
      <section className="tile-parchment">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 section-pad text-center">
          <Reveal>
            <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
              Visit the shop
            </div>
            <h2
              className="mt-2 font-semibold leading-[1.05] tracking-[-0.008em]"
              style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
            >
              {business.contact.address.city}, {business.contact.address.state}
            </h2>
            <p className="mt-5 text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
              We&apos;re a short drive from Norwalk, Stamford, Ridgefield, and
              Danbury. Walk-ins welcome — but booking guarantees a tech is ready
              for you.
            </p>
            <address className="mt-6 not-italic text-[17px] text-[var(--ink)] leading-[1.5]">
              {business.contact.address.street},{" "}
              {business.contact.address.city}, {business.contact.address.state}{" "}
              {business.contact.address.zip}
              <br />
              <span className="text-[var(--ink-muted-48)]">
                {business.contact.hoursDisplay}
              </span>
            </address>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href={`tel:${business.contact.phone}`}
                className="btn-primary px-6 py-2.5 text-[15px]"
              >
                Call {business.contact.phoneDisplay}
              </a>
              <a
                href={business.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-2.5 text-[15px]"
              >
                Get directions
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="tile-dark">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 section-pad text-center">
          <Reveal>
            <h2
              className="font-semibold leading-[1.02] tracking-[-0.008em]"
              style={{ fontSize: "clamp(40px, 6vw, 80px)" }}
            >
              Ready when you are.
            </h2>
            <p className="mt-5 text-[19px] text-white/70 leading-[1.5] max-w-xl mx-auto">
              Book a repair slot in under 60 seconds. Most appointments
              available the same day.
            </p>
            <div className="mt-9 flex justify-center">
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
      <div className="font-semibold tracking-[-0.011em] text-[var(--ink)]">
        <span style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1 }}>
          {big}
        </span>
        {suffix && (
          <span className="text-[var(--ink-muted-48)] text-[24px] ml-1">
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-2 text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
        {label}
      </div>
    </div>
  );
}
