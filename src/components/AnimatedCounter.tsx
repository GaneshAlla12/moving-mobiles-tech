"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  to: number;
  /** Number of decimal places to keep (e.g. 4.9 → 1). Default 0. */
  decimals?: number;
  /** Animation duration in ms. */
  duration?: number;
  /** Optional prefix (e.g. "$"). */
  prefix?: string;
  /** Optional suffix (e.g. "+"). */
  suffix?: string;
  /** Tailwind classes. */
  className?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function AnimatedCounter({
  to,
  decimals = 0,
  duration = 1400,
  prefix = "",
  suffix = "",
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;

        // Respect reduced motion
        if (
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          setValue(to);
          return;
        }

        const start = performance.now();
        const tick = (now: number) => {
          const elapsed = now - start;
          const t = Math.min(1, elapsed / duration);
          const eased = easeOutCubic(t);
          setValue(eased * to);
          if (t < 1) requestAnimationFrame(tick);
          else setValue(to);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
