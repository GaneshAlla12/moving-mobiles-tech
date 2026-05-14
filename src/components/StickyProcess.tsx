"use client";

import { useEffect, useRef, useState } from "react";

type Step = {
  n: string;
  t: string;
  d: string;
  art: React.ReactNode;
};

const steps: Step[] = [
  {
    n: "01",
    t: "Book online.",
    d: "See real availability and lock in a slot in under a minute. No phone tag, no callbacks.",
    art: <BookArt />,
  },
  {
    n: "02",
    t: "Bring it in.",
    d: "Walk into our Wilton shop. We'll diagnose for free and quote you on the spot — before any work begins.",
    art: <ShopArt />,
  },
  {
    n: "03",
    t: "Get it back fast.",
    d: "Most repairs done same day, with a 90-day warranty. We'll text the moment it's ready for pickup.",
    art: <DoneArt />,
  },
];

export default function StickyProcess() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      const i = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      setActive(i);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[var(--canvas)]"
      style={{ height: `${steps.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
                How it works
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                {steps.map((s, i) => (
                  <span
                    key={s.n}
                    className={`text-[12px] font-mono transition-colors ${i === active ? "text-[var(--ink)]" : "text-[var(--ink-muted-48)]"}`}
                  >
                    {s.n}
                  </span>
                ))}
              </div>
              {/* Animated headline + body that swap on step change */}
              <div className="relative mt-4 min-h-[260px]">
                {steps.map((s, i) => (
                  <div
                    key={s.n}
                    aria-hidden={i !== active}
                    className={`absolute inset-0 transition-all duration-500 ease-out ${i === active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}
                  >
                    <h2
                      className="font-semibold leading-[1.05] tracking-[-0.005em]"
                      style={{ fontSize: "clamp(38px, 6vw, 72px)" }}
                    >
                      {s.t}
                    </h2>
                    <p className="mt-5 max-w-xl text-[19px] text-[var(--ink-muted-80)] leading-[1.5]">
                      {s.d}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress dots */}
              <div className="mt-8 flex items-center gap-2">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-[var(--ink)]" : "w-1.5 bg-[var(--hairline)]"}`}
                  />
                ))}
              </div>
            </div>

            {/* Right column: visual */}
            <div className="relative aspect-square w-full max-w-[560px] mx-auto rounded-[24px] border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                >
                  {s.art}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== SVG illustrations (light, vector, brand-aware) ============== */

function BookArt() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 320 320" className="h-[68%] w-[68%]">
        <defs>
          <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="var(--ink)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Calendar */}
        <rect
          x="40"
          y="60"
          width="240"
          height="200"
          rx="22"
          fill="var(--canvas)"
          stroke="var(--hairline)"
          strokeWidth="1.5"
        />
        <rect x="40" y="60" width="240" height="44" rx="22" fill="url(#g1)" />
        <line
          x1="40"
          y1="104"
          x2="280"
          y2="104"
          stroke="var(--hairline)"
          strokeWidth="1"
        />
        <circle cx="78" cy="82" r="4" fill="var(--ink-muted-48)" />
        <circle cx="98" cy="82" r="4" fill="var(--ink-muted-48)" />
        <circle cx="118" cy="82" r="4" fill="var(--ink-muted-48)" />
        {/* Day grid */}
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3, 4, 5, 6].map((col) => {
            const isPicked = row === 2 && col === 3;
            return (
              <circle
                key={`${row}-${col}`}
                cx={68 + col * 32}
                cy={140 + row * 28}
                r={isPicked ? 14 : 4}
                fill={isPicked ? "var(--primary)" : "var(--ink-muted-48)"}
                opacity={isPicked ? 1 : 0.5}
              />
            );
          }),
        )}
        {/* Selected day label */}
        <text
          x={68 + 3 * 32}
          y={140 + 2 * 28 + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="white"
          fontFamily="SF Pro Text, system-ui, sans-serif"
        >
          14
        </text>
      </svg>
    </div>
  );
}

function ShopArt() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 320 320" className="h-[68%] w-[68%]">
        {/* Phone in hand-style */}
        <rect
          x="100"
          y="50"
          width="120"
          height="220"
          rx="22"
          fill="var(--canvas)"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <rect
          x="116"
          y="74"
          width="88"
          height="170"
          rx="6"
          fill="var(--surface-2)"
        />
        <circle cx="160" cy="60" r="2" fill="var(--ink-muted-48)" />
        {/* Crack lines */}
        <g stroke="var(--ink)" strokeWidth="1.2" fill="none" opacity="0.7">
          <path d="M132 110 L150 130 L138 150 L160 170 L150 200" />
          <path d="M150 130 L172 140" />
          <path d="M160 170 L180 180" />
        </g>
        {/* Tools */}
        <g transform="translate(40, 230) rotate(-10)">
          <rect width="80" height="6" rx="3" fill="var(--ink-muted-48)" />
          <rect x="78" y="-2" width="14" height="10" rx="2" fill="var(--ink)" />
        </g>
        <g transform="translate(220, 250) rotate(15)">
          <circle cx="0" cy="0" r="6" fill="var(--ink)" />
          <rect x="-1.5" y="6" width="3" height="40" fill="var(--ink-muted-48)" />
        </g>
      </svg>
    </div>
  );
}

function DoneArt() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 320 320" className="h-[64%] w-[64%]">
        {/* Phone */}
        <rect
          x="100"
          y="40"
          width="120"
          height="240"
          rx="22"
          fill="var(--canvas)"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <rect
          x="116"
          y="64"
          width="88"
          height="190"
          rx="8"
          fill="var(--primary)"
          opacity="0.08"
        />
        <circle cx="160" cy="50" r="2" fill="var(--ink-muted-48)" />
        {/* Big checkmark inside screen */}
        <g transform="translate(125, 130)">
          <circle cx="35" cy="35" r="34" fill="var(--primary)" />
          <polyline
            points="22,36 32,46 50,26"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {/* Sparkle dots */}
        <g fill="var(--primary)" opacity="0.7">
          <circle cx="60" cy="80" r="3" />
          <circle cx="260" cy="100" r="2" />
          <circle cx="50" cy="180" r="2" />
          <circle cx="270" cy="220" r="3" />
        </g>
      </svg>
    </div>
  );
}
