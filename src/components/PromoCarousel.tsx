"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const promos = [
  {
    day: "Day 1 · Monday",
    badge: "FREE",
    badgeColor: "#22c55e",
    headline: "Screen Slayer Monday",
    offer: "Free Mobile Diagnosis",
    sub: "No Hidden Charges",
    bullets: [
      "Free inspection of phones, laptops & tablets",
      "Discount offered only after checkup",
      "Upsell repair on the spot",
    ],
    icon: "🎁",
    accent: "#22c55e",
  },
  {
    day: "Day 2 · Tuesday",
    badge: "15–20% OFF",
    badgeColor: "#2997ff",
    headline: "Screen Fix Tuesday",
    offer: "15–20% Off Screen Repairs",
    sub: "Most Requested Service",
    bullets: [
      "iPhone + Android screens covered",
      "Same-day repair priority",
      "Bundle glass protector add-on",
    ],
    icon: "📱",
    accent: "#2997ff",
  },
  {
    day: "Day 3 · Thursday",
    badge: "FLAT DISCOUNT",
    badgeColor: "#f5b942",
    headline: "Battery Boost Thursday",
    offer: "Flat Discount on Battery Replacement",
    sub: "Keep Your Phone Running All Day",
    bullets: [
      "Fixed low price battery replacement",
      "Free health check + optimization",
      "Add fast charging cable upsell",
    ],
    icon: "🔋",
    accent: "#f5b942",
  },
  {
    day: "Day 4 · Wednesday",
    badge: "SAVE 30%",
    badgeColor: "#a78bfa",
    headline: "Accessory Profit Wednesday",
    offer: "Buy Repair = Get Discount on Accessories",
    sub: "Save Up to 30% on Accessories with Repair",
    bullets: [
      "Cases, chargers, earbuds, cables",
      "Bundle offers: Repair + Accessory pack",
      "Mix & match any accessories",
    ],
    icon: "🎧",
    accent: "#a78bfa",
  },
  {
    day: "Day 5 · Friday",
    badge: "FREE GIFT",
    badgeColor: "#22c55e",
    headline: "Buy & Protect Friday",
    offer: "Free Screen Protector with Any Repair",
    sub: "Tempered Glass Included",
    bullets: [
      "All repairs qualify",
      "Tempered glass included",
      "Plus free warranty upgrade option",
    ],
    icon: "🛡️",
    accent: "#22c55e",
  },
  {
    day: "Day 6 · Saturday",
    badge: "10% OFF",
    badgeColor: "#f97316",
    headline: "Multi-Device Saturday",
    offer: "10% Off Laptop + Tablet Repairs",
    sub: "MacBook & iPad Specialist",
    bullets: [
      "MacBook hardware & software fixes",
      "iPad screen & battery repairs",
      "Same-day quick fix priority",
    ],
    icon: "💻",
    accent: "#f97316",
  },
  {
    day: "Day 7 · Sunday",
    badge: "50% OFF",
    badgeColor: "#ef4444",
    headline: "Mega Combo Sunday",
    offer: "Buy 1 Repair → Get 2nd Service 50% Off",
    sub: "🔥 Last Day Offer — Don't Miss It",
    bullets: [
      "Phone repair + cleaning + accessory",
      "Bundle everything together",
      "Biggest savings of the week",
    ],
    icon: "🔥",
    accent: "#ef4444",
  },
];

const INTERVAL = 5000;

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

  const p = promos[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ background: "linear-gradient(135deg, #060d2e 0%, #0d1b4b 60%, #091535 100%)" }}
    >
      {/* Circuit pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M10 10h10v10H10zM40 10h10v10H40zM10 40h10v10H10zM40 40h10v10H40z'/%3E%3Cpath d='M20 15h20M15 20v20M45 20v20M20 45h20'/%3E%3Ccircle cx='15' cy='15' r='2'/%3E%3Ccircle cx='45' cy='15' r='2'/%3E%3Ccircle cx='15' cy='45' r='2'/%3E%3Ccircle cx='45' cy='45' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Slides wrapper */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {promos.map((promo, i) => (
          <Slide key={i} promo={promo} />
        ))}
      </div>

      {/* Prev / Next */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white text-xl transition-colors z-10"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
        aria-label="Previous promotion"
      >
        ‹
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white text-xl transition-colors z-10"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
        aria-label="Next promotion"
      >
        ›
      </button>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
          <div
            key={current}
            className="h-full bg-white/60"
            style={{
              animation: `promo-progress ${INTERVAL}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all duration-300"
            style={{
              height: "6px",
              width: i === current ? "20px" : "6px",
              background: i === current ? "white" : "rgba(255,255,255,0.35)",
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
    <div className="min-w-full flex items-center gap-6 px-6 py-5 sm:px-10 sm:py-7">
      {/* Left — icon + badge */}
      <div className="hidden sm:flex flex-col items-center gap-3 shrink-0">
        <span className="text-5xl leading-none">{promo.icon}</span>
        <span
          className="text-[11px] font-bold tracking-wider px-3 py-1 rounded-full"
          style={{ background: promo.badgeColor, color: "#fff" }}
        >
          {promo.badge}
        </span>
      </div>

      {/* Divider */}
      <div
        className="hidden sm:block w-px self-stretch opacity-20 shrink-0"
        style={{ background: promo.accent }}
      />

      {/* Center — main copy */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-1"
          style={{ color: promo.accent }}
        >
          {promo.day}
        </div>
        <div className="text-white font-bold leading-tight mb-1" style={{ fontSize: "clamp(16px, 2.2vw, 22px)" }}>
          {promo.headline}
        </div>
        <div className="text-white/90 font-semibold" style={{ fontSize: "clamp(13px, 1.6vw, 17px)" }}>
          {promo.offer}
        </div>
        <div className="text-white/55 text-[12px] mt-0.5">{promo.sub}</div>
      </div>

      {/* Right — bullets */}
      <div className="hidden md:flex flex-col gap-1.5 shrink-0 max-w-[220px]">
        {promo.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] text-white/75">
            <span style={{ color: promo.accent }} className="mt-px shrink-0">✓</span>
            <span>{b}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href="/book"
        className="hidden lg:inline-flex shrink-0 items-center gap-1 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: promo.accent }}
      >
        Book now →
      </a>
    </div>
  );
}
