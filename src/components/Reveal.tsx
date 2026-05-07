"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Use staggered reveal for direct children (instead of revealing the whole block at once). */
  stagger?: boolean;
  /** Tailwind classes applied to the wrapper. */
  className?: string;
  /** Delay (ms) before the reveal animation starts. */
  delay?: number;
  /** intersection threshold (0-1). Default 0.15 */
  threshold?: number;
  /** When true, only animates once (default). Set false to re-animate on re-entry. */
  once?: boolean;
  /** Render as a different element. Defaults to div. */
  as?: keyof HTMLElementTagNameMap;
};

export default function Reveal({
  children,
  stagger = false,
  className = "",
  delay = 0,
  threshold = 0.15,
  once = true,
  as = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          if (once) obs.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, threshold, once]);

  const Tag = as as React.ElementType;
  const baseCls = stagger ? "reveal-stagger" : "reveal";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${baseCls} ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
