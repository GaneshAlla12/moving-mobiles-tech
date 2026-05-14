"use client";

import { useEffect, useState } from "react";
import { getOpenStatus, shopHoursDisplay } from "@/lib/booking";

export default function StoreHoursCard() {
  const [status, setStatus] = useState(() => getOpenStatus());
  useEffect(() => {
    const tick = () => setStatus(getOpenStatus());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const pillBg = status.isOpen
    ? "rgba(34, 197, 94, 0.10)"
    : "rgba(245, 158, 11, 0.10)";
  const pillFg = status.isOpen ? "#15803d" : "#b45309";
  const pillDot = status.isOpen ? "#22c55e" : "#f59e0b";

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold tracking-[-0.011em]">
            Store hours
          </div>
          {status.detail && (
            <div className="mt-0.5 text-[12px] text-[var(--ink-muted-60)] tabular-nums">
              {status.detail}
            </div>
          )}
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] shrink-0"
          style={{ background: pillBg, color: pillFg }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: pillDot,
              boxShadow: status.isOpen ? `0 0 6px ${pillDot}` : undefined,
              animation: status.isOpen
                ? "mm-glow-pulse 2s ease-in-out infinite"
                : undefined,
            }}
            aria-hidden="true"
          />
          {status.label}
        </span>
      </div>

      <ul className="mt-4 space-y-1.5">
        {shopHoursDisplay.map((row) => {
          const isToday = row.dayIndices.includes(status.todayIndex);
          return (
            <li
              key={row.days}
              className="flex items-center justify-between gap-3 rounded-[10px] px-3 py-2 transition-colors"
              style={{
                background: isToday
                  ? "var(--primary-soft)"
                  : "var(--canvas-elevated)",
                border: `1px solid ${isToday ? "var(--primary)" : "var(--hairline)"}`,
              }}
            >
              <span className="min-w-0 flex items-center gap-2">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: isToday
                      ? "var(--primary)"
                      : "var(--ink-muted-32)",
                  }}
                  aria-hidden="true"
                />
                <span
                  className="text-[12.5px] truncate"
                  style={{
                    color: isToday ? "var(--ink)" : "var(--ink-muted-60)",
                    fontWeight: isToday ? 600 : 500,
                  }}
                >
                  {row.days}
                </span>
                {isToday && (
                  <span
                    className="text-[9px] uppercase tracking-[0.12em] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                    style={{
                      background: "var(--primary)",
                      color: "var(--on-primary)",
                    }}
                  >
                    Today
                  </span>
                )}
              </span>
              <span
                className="text-[12px] tabular-nums shrink-0"
                style={{
                  color: isToday ? "var(--ink)" : "var(--ink-muted-80)",
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {row.hours}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
