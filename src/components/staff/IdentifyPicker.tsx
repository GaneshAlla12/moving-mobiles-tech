"use client";

import { useEffect, useRef, useState } from "react";
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
  const [selected, setSelected] = useState<Employee | null>(null);
  const target = next && /^\/[\w/?=&-]*$/.test(next) ? next : "/staff/attendance";

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
        {selected ? (
          <PinEntry
            employee={selected}
            target={target}
            onBack={() => setSelected(null)}
          />
        ) : (
          <NamePicker
            target={target}
            onPick={(e) => setSelected(e)}
          />
        )}
      </div>
    </section>
  );
}

function NamePicker({
  onPick,
  target,
}: {
  onPick: (e: Employee) => void;
  target: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickViewer = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/staff/identify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ employee: "__viewer" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Sign-in failed");
      window.location.href = target;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <>
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
          Tap your name, then enter your PIN to start your shift.
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
          return (
            <button
              key={e}
              onClick={() => onPick(e)}
              className="relative rounded-[20px] p-5 text-left transition-all overflow-hidden"
              style={{
                background: "var(--canvas)",
                border: "1px solid var(--hairline)",
                boxShadow: "var(--shadow-1)",
              }}
              onMouseEnter={(ev) => {
                ev.currentTarget.style.borderColor = palette.hue;
                ev.currentTarget.style.transform = "translateY(-2px)";
                ev.currentTarget.style.boxShadow = `0 12px 32px ${palette.soft}`;
              }}
              onMouseLeave={(ev) => {
                ev.currentTarget.style.borderColor = "var(--hairline)";
                ev.currentTarget.style.transform = "translateY(0)";
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
                    Tap to enter PIN
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
          onClick={pickViewer}
          disabled={busy}
          className="text-[13px] text-[var(--ink-muted-60)] hover:text-[var(--ink)] transition-colors"
        >
          Manager view-only
          <span className="text-[var(--ink-muted-32)]"> · skip clock-in</span>
        </button>
      </div>
    </>
  );
}

function PinEntry({
  employee,
  target,
  onBack,
}: {
  employee: Employee;
  target: string;
  onBack: () => void;
}) {
  const palette = PALETTE[employee];
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (value: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/staff/identify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ employee, pin: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Wrong PIN");
      window.location.href = target;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wrong PIN");
      setShake(true);
      setPin("");
      setBusy(false);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  const onChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setPin(digits);
    setError(null);
    if (digits.length === 4) submit(digits);
  };

  const tap = (digit: string) => {
    if (busy) return;
    if (digit === "back") {
      setPin((p) => p.slice(0, -1));
      setError(null);
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(null);
    if (next.length === 4) submit(next);
  };

  return (
    <div className="text-center">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-muted-60)] hover:text-[var(--ink)] transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Pick someone else
      </button>

      <div
        className="grid place-items-center rounded-full text-white font-semibold mx-auto mb-5"
        style={{
          width: 88,
          height: 88,
          fontSize: 34,
          background: palette.bg,
          boxShadow: `0 0 0 6px ${palette.soft}, 0 12px 36px ${palette.soft}`,
        }}
        aria-hidden="true"
      >
        {initialsOf(employee)}
      </div>

      <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-60)] font-medium">
        Hello,
      </div>
      <h1 className="mt-1 text-[32px] font-semibold tracking-[-0.022em]">
        {employee}
      </h1>
      <p className="mt-2 text-[14px] text-[var(--ink-muted-60)]">
        Enter your 4-digit PIN to clock in
      </p>

      {/* PIN dots */}
      <div
        className={`mt-7 flex justify-center gap-3 ${shake ? "mm-shake" : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        {[0, 1, 2, 3].map((i) => {
          const filled = i < pin.length;
          return (
            <div
              key={i}
              className="relative grid place-items-center rounded-full transition-all"
              style={{
                width: 56,
                height: 56,
                background: filled ? palette.bg : "var(--canvas)",
                border: `1px solid ${filled ? "transparent" : "var(--hairline-strong)"}`,
                boxShadow: filled
                  ? `0 4px 12px ${palette.soft}`
                  : "var(--shadow-1)",
              }}
            >
              {filled && (
                <span
                  className="block w-2.5 h-2.5 rounded-full bg-white"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden input for keyboard entry */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        value={pin}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        aria-label={`PIN for ${employee}`}
      />

      {error && (
        <div className="mt-5 text-[13px] text-[#b91c1c] font-medium">
          {error}
        </div>
      )}

      {/* Numeric keypad — tappable on touch devices */}
      <div className="mt-7 mx-auto max-w-[260px] grid grid-cols-3 gap-2.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map(
          (k, i) => {
            if (k === "")
              return <div key={i} aria-hidden="true" />;
            if (k === "back") {
              return (
                <button
                  key={i}
                  onClick={() => tap("back")}
                  className="grid place-items-center h-14 rounded-[14px] text-[var(--ink-muted-60)] hover:text-[var(--ink)] transition-colors"
                  style={{
                    background: "var(--canvas)",
                    border: "1px solid var(--hairline)",
                  }}
                  aria-label="Delete"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                </button>
              );
            }
            return (
              <button
                key={i}
                onClick={() => tap(k)}
                disabled={busy}
                className="h-14 rounded-[14px] text-[20px] font-semibold tabular-nums transition-all"
                style={{
                  background: "var(--canvas)",
                  border: "1px solid var(--hairline)",
                  color: "var(--ink)",
                  opacity: busy ? 0.5 : 1,
                }}
                onMouseEnter={(ev) => {
                  if (busy) return;
                  ev.currentTarget.style.borderColor = palette.hue;
                  ev.currentTarget.style.background = palette.soft;
                  ev.currentTarget.style.color = palette.hue;
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.borderColor = "var(--hairline)";
                  ev.currentTarget.style.background = "var(--canvas)";
                  ev.currentTarget.style.color = "var(--ink)";
                }}
              >
                {k}
              </button>
            );
          },
        )}
      </div>

      <style>{`
        @keyframes mm-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .mm-shake { animation: mm-shake 420ms cubic-bezier(0.36, 0.07, 0.19, 0.97); }
      `}</style>
    </div>
  );
}
