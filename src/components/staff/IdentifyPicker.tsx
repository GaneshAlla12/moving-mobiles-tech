"use client";

import { useState } from "react";
import { EMPLOYEES, type Employee } from "@/lib/schedule";

const PALETTE: Record<Employee, { hue: string; bg: string; soft: string }> = {
  Satya: {
    hue: "#0071e3",
    bg: "linear-gradient(135deg, #0071e3 0%, #0058b8 100%)",
    soft: "rgba(0, 113, 227, 0.10)",
  },
  Niteesh: {
    hue: "#8b5cf6",
    bg: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    soft: "rgba(139, 92, 246, 0.10)",
  },
  Bharath: {
    hue: "#10b981",
    bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    soft: "rgba(16, 185, 129, 0.10)",
  },
  Trainee: {
    hue: "#f59e0b",
    bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    soft: "rgba(245, 158, 11, 0.10)",
  },
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || name.slice(0, 2).toUpperCase();

export default function IdentifyPicker({ next }: { next?: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const target = next && /^\/[\w/?=&-]*$/.test(next) ? next : "/staff/attendance";

  const pick = async (value: string) => {
    if (busy) return;
    setBusy(value);
    setError(null);
    try {
      const res = await fetch("/api/staff/identify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ employee: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Sign-in failed");
      window.location.href = target;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setBusy(null);
    }
  };

  return (
    <section className="min-h-[calc(100vh-72px)] grid place-items-center px-5 py-16 relative overflow-hidden bg-[var(--canvas-sunken)]">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--primary-soft) 0%, transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="eyebrow flex items-center justify-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#22c55e" }}
            />
            Signed in
          </div>
          <h1 className="mt-3 text-[36px] font-semibold tracking-[-0.022em] leading-[1.05]">
            Who&apos;s clocking in?
          </h1>
          <p className="mt-3 text-[15px] text-[var(--ink-muted-60)] leading-[1.55] max-w-md mx-auto">
            Tap your name to start your shift. Signing out at the end of
            the day clocks you out automatically.
          </p>
        </div>

        {error && (
          <div
            className="mb-5 rounded-[10px] px-3 py-2 text-[13px] flex items-center gap-2"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              color: "#b91c1c",
              border: "1px solid rgba(239, 68, 68, 0.20)",
            }}
          >
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {EMPLOYEES.map((e) => {
            const palette = PALETTE[e];
            const isBusy = busy === e;
            return (
              <button
                key={e}
                onClick={() => pick(e)}
                disabled={!!busy}
                className="relative rounded-[20px] p-5 text-left transition-all overflow-hidden"
                style={{
                  background: "var(--canvas)",
                  border: "1px solid var(--hairline)",
                  boxShadow: "var(--shadow-1)",
                  opacity: busy && !isBusy ? 0.5 : 1,
                  cursor: busy ? "not-allowed" : "pointer",
                  transform: isBusy ? "scale(0.98)" : "scale(1)",
                }}
                onMouseEnter={(ev) => {
                  if (busy) return;
                  ev.currentTarget.style.borderColor = palette.hue;
                  ev.currentTarget.style.transform = "translateY(-2px)";
                  ev.currentTarget.style.boxShadow = `0 12px 32px ${palette.soft}`;
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.borderColor = "var(--hairline)";
                  ev.currentTarget.style.transform = "scale(1)";
                  ev.currentTarget.style.boxShadow = "var(--shadow-1)";
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.06]"
                  style={{ background: palette.bg }}
                />
                <div className="relative flex items-center gap-4">
                  <div
                    className="grid place-items-center rounded-full text-white font-semibold tracking-[-0.01em] shrink-0"
                    style={{
                      width: 56,
                      height: 56,
                      fontSize: 22,
                      background: palette.bg,
                      boxShadow: `0 0 0 4px ${palette.soft}`,
                    }}
                    aria-hidden="true"
                  >
                    {initialsOf(e)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[20px] font-semibold tracking-[-0.012em] text-[var(--ink)]">
                      {e}
                    </div>
                    <div className="text-[12px] text-[var(--ink-muted-60)] mt-0.5">
                      {isBusy ? "Clocking in…" : "Tap to clock in"}
                    </div>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={palette.hue}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => pick("__viewer")}
            disabled={!!busy}
            className="text-[13px] text-[var(--ink-muted-60)] hover:text-[var(--ink)] transition-colors"
          >
            Manager view-only
            <span className="text-[var(--ink-muted-32)]"> · skip clock-in</span>
          </button>
        </div>
      </div>
    </section>
  );
}
