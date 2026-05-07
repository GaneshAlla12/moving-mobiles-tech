"use client";

import { useEffect } from "react";

/**
 * Lenis-powered inertial smooth scroll for the whole site.
 * Lenis (https://lenis.darkroom.engineering/) is what Linear, Apple, and
 * most premium product sites use. It hijacks the scroll wheel/touch and
 * eases the scroll position with a tuned cubic curve.
 *
 * Honors prefers-reduced-motion: skips entirely if the user has it set.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;

    (async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      }) as unknown as { raf: (t: number) => void; destroy: () => void };

      const tick = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
