"use client";

import { useEffect, useMemo, useState } from "react";
import { EMPLOYEES, type Employee } from "@/lib/schedule";
import {
  formatMinutes,
  formatTimeShort,
  type EmployeeDaySummary,
  type Punch,
} from "@/lib/attendance";

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
  Liv: {
    hue: "#ec4899",
    bg: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    soft: "rgba(236, 72, 153, 0.10)",
  },
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || name.slice(0, 2).toUpperCase();

type Props = {
  date: string;
  today: string;
  isToday: boolean;
  initialSummaries: EmployeeDaySummary[];
  initialPunches: Punch[];
};

export default function AttendanceView({
  date,
  today,
  isToday,
  initialSummaries,
  initialPunches,
}: Props) {
  const [summaries, setSummaries] =
    useState<EmployeeDaySummary[]>(initialSummaries);
  const [punches, setPunches] = useState<Punch[]>(initialPunches);
  const [error] = useState<string | null>(null);

  // Refresh summaries every 30s when viewing today (so "currently signed in"
  // counters tick up). Skip on past days — they're stable.
  useEffect(() => {
    if (!isToday) return;
    const tick = setInterval(() => {
      // Recompute summaries client-side from punches (cheap)
      setSummaries((prev) => prev.map((s) => recomputeMinutes(s)));
    }, 30000);
    return () => clearInterval(tick);
  }, [isToday]);

  const totalActive = summaries.filter((s) => s.status === "in").length;

  // Auto-refresh today's data every 30s so the page stays current as
  // employees sign in/out via the staff portal.
  useEffect(() => {
    if (!isToday) return;
    const tick = setInterval(async () => {
      try {
        const r = await fetch(`/api/staff/attendance?date=${date}`, {
          cache: "no-store",
        });
        const fresh = await r.json();
        if (fresh?.log) {
          setPunches(fresh.log.punches ?? []);
          setSummaries(fresh.summaries ?? []);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(tick);
  }, [isToday, date]);

  const goDate = (delta: number) => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    window.location.search = `?date=${y}-${m}-${dd}`;
  };

  const dateLabel = useMemo(() => {
    const d = new Date(date + "T12:00:00.000Z");
    if (date === today) return "Today";
    const t = new Date();
    t.setDate(t.getDate() - 1);
    const y = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    if (date === y) return "Yesterday";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(d);
  }, [date, today]);

  return (
    <div className="space-y-6">
      {/* Toolbar — date navigator + summary chip */}
      <div
        className="sticky top-[72px] z-20 flex items-center justify-between gap-4 rounded-[14px] px-5 py-3"
        style={{
          background: "var(--glass-bg-strong)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => goDate(-1)}
            className="grid h-8 w-8 place-items-center rounded-full"
            style={{
              background: "var(--canvas-elevated)",
              border: "1px solid var(--hairline)",
            }}
            aria-label="Previous day"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-[15px] font-semibold tracking-[-0.012em] tabular-nums">
            {dateLabel}
            <span className="ml-2 text-[12px] text-[var(--ink-muted-60)] tabular-nums">
              {date}
            </span>
          </div>
          <button
            onClick={() => goDate(1)}
            disabled={date >= today}
            className="grid h-8 w-8 place-items-center rounded-full transition-opacity"
            style={{
              background: "var(--canvas-elevated)",
              border: "1px solid var(--hairline)",
              opacity: date >= today ? 0.4 : 1,
              cursor: date >= today ? "not-allowed" : "pointer",
            }}
            aria-label="Next day"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {!isToday && (
            <a
              href="?date="
              className="hidden sm:inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ml-1 transition-colors"
              style={{
                background: "var(--canvas-elevated)",
                border: "1px solid var(--hairline)",
                color: "var(--ink-muted-60)",
              }}
            >
              Today
            </a>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-[12px]">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold tabular-nums"
            style={{
              background: totalActive > 0 ? "rgba(34, 197, 94, 0.10)" : "var(--canvas-elevated)",
              color: totalActive > 0 ? "#15803d" : "var(--ink-muted-60)",
              border: `1px solid ${totalActive > 0 ? "rgba(34, 197, 94, 0.25)" : "var(--hairline)"}`,
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: totalActive > 0 ? "#22c55e" : "var(--ink-muted-48)",
                animation:
                  totalActive > 0 ? "mm-glow-pulse 1.6s ease-in-out infinite" : undefined,
              }}
            />
            {totalActive > 0
              ? `${totalActive} signed in`
              : "Nobody signed in"}
          </span>
        </div>
      </div>

      {error && (
        <div
          className="rounded-[10px] px-3 py-2 text-[13px] flex items-start gap-2"
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

      {/* Clock cards — one per employee */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EMPLOYEES.map((employee) => {
          const summary =
            summaries.find((s) => s.employee === employee) ??
            ({
              employee,
              status: "off",
              minutesWorked: 0,
              segments: [],
            } as EmployeeDaySummary);
          return (
            <ClockCard
              key={employee}
              summary={summary}
              isToday={isToday}
            />
          );
        })}
      </div>

      {/* Timeline */}
      <div
        className="rounded-[16px]"
        style={{
          background: "var(--canvas)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="px-5 py-4 border-b border-[var(--hairline)] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium">
              Punch log
            </div>
            <div className="text-[15px] font-semibold mt-0.5">
              {punches.length} {punches.length === 1 ? "event" : "events"}
            </div>
          </div>
        </div>
        {punches.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-[14px] text-[var(--ink-muted-60)]">
              No punches yet for {dateLabel.toLowerCase()}.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {[...punches]
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
              .map((p, i) => (
                <PunchRow key={i} punch={p} />
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Recomputes minutesWorked using current time, for live-tick. */
function recomputeMinutes(s: EmployeeDaySummary): EmployeeDaySummary {
  let mins = 0;
  for (const seg of s.segments) {
    const start = new Date(seg.in.timestamp).getTime();
    const end = seg.out ? new Date(seg.out.timestamp).getTime() : Date.now();
    mins += Math.max(0, Math.round((end - start) / 60000));
  }
  return { ...s, minutesWorked: mins };
}

function ClockCard({
  summary,
  isToday,
}: {
  summary: EmployeeDaySummary;
  isToday: boolean;
}) {
  const palette = PALETTE[summary.employee];
  const isIn = summary.status === "in";

  return (
    <div
      className="relative rounded-[18px] p-5 overflow-hidden"
      style={{
        background: "var(--canvas)",
        border: "1px solid var(--hairline)",
        boxShadow: "var(--shadow-1)",
      }}
    >
      {/* Status glow */}
      {isIn && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{ background: palette.bg }}
        />
      )}

      <div className="relative">
        <div className="flex items-center gap-3">
          <div
            className="grid place-items-center rounded-full text-white font-semibold tracking-[-0.01em] shrink-0"
            style={{
              width: 44,
              height: 44,
              fontSize: 16,
              background: palette.bg,
              boxShadow: `0 0 0 3px ${palette.soft}`,
            }}
          >
            {initialsOf(summary.employee)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold tracking-[-0.012em] text-[var(--ink)]">
              {summary.employee}
            </div>
            <StatusBadge status={summary.status} hue={palette.hue} />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <div>
            <div className="font-semibold tracking-[-0.02em] tabular-nums leading-none text-[var(--ink)]"
              style={{ fontSize: "26px" }}
            >
              {formatMinutes(summary.minutesWorked)}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-60)] font-medium">
              {summary.status === "in" ? "ticking" : "today"}
            </div>
          </div>
          {summary.lastPunch && (
            <div className="text-right">
              <div className="text-[11px] text-[var(--ink-muted-48)] uppercase tracking-[0.14em] font-medium">
                Last
              </div>
              <div className="text-[12px] tabular-nums text-[var(--ink-muted-80)]">
                {summary.lastPunch.type === "in" ? "In " : "Out "}
                {formatTimeShort(summary.lastPunch.timestamp)}
              </div>
            </div>
          )}
        </div>

        {/* Auto-tracking hint */}
        {isToday && summary.status === "off" && (
          <div
            className="mt-4 rounded-[10px] px-3 py-2 text-[11px] text-[var(--ink-muted-60)] leading-[1.4]"
            style={{
              background: "var(--canvas-elevated)",
              border: "1px dashed var(--hairline)",
            }}
          >
            Will clock in automatically when {summary.employee} signs into
            the staff portal.
          </div>
        )}

        {/* Segment list */}
        {summary.segments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--hairline)] space-y-1.5">
            {summary.segments.map((seg, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[12px] tabular-nums"
              >
                <span className="text-[var(--ink-muted-80)]">
                  {formatTimeShort(seg.in.timestamp)}
                  <span className="mx-1.5 text-[var(--ink-muted-32)]">→</span>
                  {seg.out ? (
                    formatTimeShort(seg.out.timestamp)
                  ) : (
                    <span style={{ color: palette.hue }}>now</span>
                  )}
                </span>
                <span className="text-[var(--ink-muted-48)]">
                  {formatMinutes(
                    Math.round(
                      (new Date(seg.out?.timestamp ?? Date.now()).getTime() -
                        new Date(seg.in.timestamp).getTime()) /
                        60000,
                    ),
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  hue,
}: {
  status: EmployeeDaySummary["status"];
  hue: string;
}) {
  if (status === "in") {
    return (
      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold tabular-nums">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: hue,
            animation: "mm-glow-pulse 1.6s ease-in-out infinite",
          }}
        />
        <span style={{ color: hue }}>Signed in</span>
      </div>
    );
  }
  if (status === "out") {
    return (
      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--ink-muted-60)] font-medium">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--ink-muted-48)" }}
        />
        Signed out
      </div>
    );
  }
  return (
    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--ink-muted-48)] font-medium">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--ink-muted-32)" }}
      />
      Off
    </div>
  );
}

function PunchRow({ punch }: { punch: Punch }) {
  const palette = PALETTE[punch.employee];
  const isIn = punch.type === "in";
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <span
        className="grid place-items-center rounded-full text-white text-[10px] font-semibold shrink-0"
        style={{
          width: 26,
          height: 26,
          background: palette.bg,
        }}
      >
        {initialsOf(punch.employee)}
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-[14px] font-semibold text-[var(--ink)] mr-2">
          {punch.employee}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums uppercase tracking-[0.06em] rounded-full px-2 py-0.5"
          style={{
            background: isIn ? "rgba(34, 197, 94, 0.10)" : "var(--canvas-elevated)",
            color: isIn ? "#15803d" : "var(--ink-muted-60)",
            border: `1px solid ${isIn ? "rgba(34, 197, 94, 0.25)" : "var(--hairline)"}`,
          }}
        >
          <span
            className="inline-block w-1 h-1 rounded-full"
            style={{ background: isIn ? "#22c55e" : "var(--ink-muted-48)" }}
          />
          {isIn ? "Clocked in" : "Clocked out"}
        </span>
      </span>
      <span className="text-[13px] tabular-nums text-[var(--ink-muted-80)] shrink-0">
        {formatTimeShort(punch.timestamp)}
      </span>
    </li>
  );
}
