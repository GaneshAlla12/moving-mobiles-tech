"use client";

import { useRef, useEffect, ReactNode } from "react";

/**
 * Wraps a button/link so the inner content tilts toward the cursor on hover.
 * Subtle Apple/Linear-style magnetic effect — only inside the element bounds,
 * eased back to center on leave. Disabled with prefers-reduced-motion.
 */
export default function MagneticButton({
  children,
  strength = 0.25,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0, 0)";
    };

    const parent = el.parentElement;
    if (!parent) return;
    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={`magnetic ${className ?? ""}`}
      style={{ display: "inline-flex" }}
    >
      {children}
    </div>
  );
}
