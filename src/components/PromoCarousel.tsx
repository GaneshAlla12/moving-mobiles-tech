"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const promos = [
  {
    day: "Day 1",
    weekday: "Monday",
    badge: "Free",
    headline: "Screen Slayer Monday",
    offer: "Free mobile diagnosis on every device",
    sub: "No hidden charges",
    bullets: [
      "Free inspection of phones, laptops & tablets",
      "Discount only after checkup",
      "Upsell repair on the spot",
    ],
  },
  {
    day: "Day 2",
    weekday: "Tuesday",
    badge: "15–20% off",
    headline: "Screen Fix Tuesday",
    offer: "15–20% off all screen repairs",
    sub: "Most requested service",
    bullets: [
      "iPhone + Android screens covered",
      "Same-day repair priority",
      "Bundle glass protector add-on",
    ],
  },
  {
    day: "Day 3",
    weekday: "Thursday",
    badge: "Flat discount",
    headline: "Battery Boost Thursday",
    offer: "Fixed-price battery replacement",
    sub: "Keep your phone running all day",
    bullets: [
      "Free health check + optimization",
      "OEM-grade replacement cells",
      "Add fast-charging cable upsell",
    ],
  },
  {
    day: "Day 4",
    weekday: "Wednesday",
    badge: "Save 30%",
    headline: "Accessory Profit Wednesday",
    offer: "Repair + accessory bundle savings",
    sub: "Up to 30% off with any repair",
    bullets: [
      "Cases, chargers, earbuds, cables",
      "Repair + accessory pack bundles",
      "Mix and match anything",
    ],
  },
  {
    day: "Day 5",
    weekday: "Friday",
    badge: "Free gift",
    headline: "Buy & Protect Friday",
    offer: "Free screen protector with any repair",
    sub: "Tempered glass, fitted by us",
    bullets: [
      "All repairs qualify",
      "Tempered glass included",
      "Free warranty upgrade option",
    ],
  },
  {
    day: "Day 6",
    weekday: "Saturday",
    badge: "10% off",
    headline: "Multi-Device Saturday",
    offer: "10% off laptop + tablet repairs",
    sub: "MacBook & iPad specialists",
    bullets: [
      "MacBook hardware & software fixes",
      "iPad screen & battery repairs",
      "Same-day quick fix priority",
    ],
  },
  {
    day: "Day 7",
    weekday: "Sunday",
    badge: "50% off",
    headline: "Mega Combo Sunday",
    offer: "Buy one repair → get 2nd service 50% off",
    sub: "Last day of the week",
    bullets: [
      "Repair + cleaning + accessory bundles",
      "Stack with weekly deals",
      "Biggest savings of the week",
    ],
  },
];

const INTERVAL = 5500;

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (idx: number) => setCurrent((idx + promos.length) % promos.length),
    []
  );

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % promos.length),
      INTERVAL
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] glass-strong"
      style={{
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides wrapper */}
      <div
        className="flex"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: "transform 700ms var(--ease-out-expo)",
        }}
      >
        {promos.map((promo, i) => (
          <Slide key={i} promo={promo} />
        ))}
      </div>

      {/* Prev / Next — vertically centered side controls */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white z-10 hover:bg-white/12 transition-colors"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(8px)",
        }}
        aria-label="Previous promotion"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white z-10 hover:bg-white/12 transition-colors"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(8px)",
        }}
        aria-label="Next promotion"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Progress bar */}
      {!paused && (
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)" }}
        >
          <div
            key={current}
            className="h-full bg-white/55"
            style={{
              animation: `promo-progress ${INTERVAL}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* Dots */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full"
            style={{
              height: "5px",
              width: i === current ? "18px" : "5px",
              background: i === current ? "white" : "rgba(255,255,255,0.30)",
              transition: "all 300ms var(--ease-out-expo)",
            }}
            aria-label={`Go to promotion ${i + 1}`}
          />
        ))}
      </div>

      <style>{`
        @keyframes promo-progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}

function Slide({ promo }: { promo: (typeof promos)[number] }) {
  return (
    <div className="min-w-full flex items-center gap-6 px-12 py-6 sm:px-16 sm:py-8 sm:pb-10">
      {/* Left — day label stack */}
      <div className="hidden sm:flex flex-col gap-2 shrink-0 min-w-[112px]">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-medium">
          {promo.day}
        </div>
        <div className="text-[15px] text-white font-semibold">
          {promo.weekday}
        </div>
        <div
          className="mt-1 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] text-white/85 uppercase"
          style={{
            background: "rgba(255, 255, 255, 0.10)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          {promo.badge}
        </div>
      </div>

      {/* Divider */}
      <div
        className="hidden sm:block w-px self-stretch shrink-0"
        style={{ background: "rgba(255, 255, 255, 0.10)" }}
      />

      {/* Center — main copy */}
      <div className="flex-1 min-w-0 max-w-md">
        <div
          className="text-white font-semibold leading-[1.15] tracking-[-0.012em]"
          style={{ fontSize: "clamp(17px, 2.2vw, 22px)" }}
        >
          {promo.headline}
        </div>
        <div className="mt-1.5 text-white/85 text-[14px] leading-[1.45]">
          {promo.offer}
        </div>
        <div className="mt-1 text-white/45 text-[12px]">{promo.sub}</div>
      </div>

      {/* Right — bullets */}
      <div className="hidden md:flex flex-col gap-1.5 shrink-0 max-w-[220px]">
        {promo.bullets.map((b, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-[12px] text-white/65 leading-[1.45]"
          >
            <span className="text-white/40 mt-px shrink-0">·</span>
            <span>{b}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href="/book"
        className="hidden lg:inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-black bg-white hover:bg-white/90 transition-all hover:scale-[1.02]"
      >
        Book now
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </a>
    </div>
  );
}
