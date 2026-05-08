"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  EMPLOYEES,
  type Shift,
  type Employee,
  DEFAULT_START_TIMES,
  endOfShift,
  formatTime12h,
  formatYmd,
  addDays,
} from "@/lib/schedule";

type Props = {
  weekStart: string; // YYYY-MM-DD (Monday)
  initialShifts: Shift[];
};

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error"; message: string };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Per-employee identity. Used for shift card accents, avatars, and stats. */
const PALETTE: Record<
  Employee,
  { hue: string; bg: string; ring: string; soft: string }
> = {
  Satya: {
    hue: "#0071e3",
    bg: "linear-gradient(135deg, #0071e3 0%, #0058b8 100%)",
    ring: "rgba(0, 113, 227, 0.35)",
    soft: "rgba(0, 113, 227, 0.10)",
  },
  Niteesh: {
    hue: "#8b5cf6",
    bg: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    ring: "rgba(139, 92, 246, 0.35)",
    soft: "rgba(139, 92, 246, 0.10)",
  },
  Bharath: {
    hue: "#10b981",
    bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    ring: "rgba(16, 185, 129, 0.35)",
    soft: "rgba(16, 185, 129, 0.10)",
  },
  Trainee: {
    hue: "#f59e0b",
    bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    ring: "rgba(245, 158, 11, 0.35)",
    soft: "rgba(245, 158, 11, 0.10)",
  },
};

const initialsOf = (name: string) =>
  name.length <= 2
    ? name.toUpperCase()
    : name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      name.slice(0, 2).toUpperCase();

export default function ScheduleEditor({ weekStart, initialShifts }: Props) {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [editing, setEditing] = useState<{
    employee: Employee;
    date: string;
  } | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // weekDates: 7 dates starting at weekStart
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Index shifts by "employee|date" for fast lookup
  const shiftMap = useMemo(() => {
    const m = new Map<string, Shift>();
    for (const s of shifts) m.set(`${s.employee}|${s.date}`, s);
    return m;
  }, [shifts]);

  const setShift = (employee: Employee, date: string, startTime: string) => {
    setShifts((prev) => {
      const filtered = prev.filter(
        (s) => !(s.employee === employee && s.date === date),
      );
      return [...filtered, { employee, date, startTime }];
    });
    setEditing(null);
  };

  const removeShift = (employee: Employee, date: string) => {
    setShifts((prev) =>
      prev.filter((s) => !(s.employee === employee && s.date === date)),
    );
    setEditing(null);
  };

  const totalShifts = shifts.length;
  const totalHours = totalShifts * 5;

  // Locked = strictly before today (past days are read-only)
  const todayYmd = useMemo(() => formatYmd(new Date()), []);
  const isLocked = (date: string) => date < todayYmd;

  // Per-employee weekly hours
  const hoursByEmployee = useMemo(() => {
    const m = new Map<Employee, number>();
    for (const e of EMPLOYEES) m.set(e, 0);
    for (const s of shifts) {
      m.set(s.employee, (m.get(s.employee) ?? 0) + 5);
    }
    return m;
  }, [shifts]);

  const onSave = async () => {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/staff/schedule", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ weekStart, shifts }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      setStatus({ kind: "saved", at: new Date().toLocaleTimeString() });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Save failed",
      });
    }
  };

  const goWeek = (delta: number) => {
    const newStart = addDays(weekStart, delta * 7);
    window.location.search = `?week=${newStart}`;
  };

  const weekLabel = useMemo(() => {
    const start = new Date(weekStart + "T00:00:00");
    const end = new Date(addDays(weekStart, 6) + "T00:00:00");
    const sameMonth = start.getMonth() === end.getMonth();
    const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
      d.toLocaleDateString("en-US", opts);
    if (sameMonth) {
      return `${fmt(start, { month: "long" })} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric" })}, ${start.getFullYear()}`;
  }, [weekStart]);

  const today = todayYmd;
  const allLocked = weekDates.every((d) => isLocked(d));

  return (
    <div className="space-y-5">
      {/* Toolbar */}
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
            onClick={() => goWeek(-1)}
            className="grid h-8 w-8 place-items-center rounded-full transition-colors"
            style={{
              background: "var(--canvas-elevated)",
              border: "1px solid var(--hairline)",
            }}
            aria-label="Previous week"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-[15px] font-semibold tracking-[-0.012em] tabular-nums">
            {weekLabel}
          </div>
          <button
            onClick={() => goWeek(1)}
            className="grid h-8 w-8 place-items-center rounded-full transition-colors"
            style={{
              background: "var(--canvas-elevated)",
              border: "1px solid var(--hairline)",
            }}
            aria-label="Next week"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            onClick={() => goWeek(0)}
            className="hidden sm:inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ml-2 transition-colors"
            style={{
              background: "var(--canvas-elevated)",
              border: "1px solid var(--hairline)",
              color: "var(--ink-muted-60)",
            }}
          >
            This week
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums"
            style={{
              background: "var(--canvas-elevated)",
              color: "var(--ink-muted-60)",
              border: "1px solid var(--hairline)",
            }}
          >
            {totalShifts} shifts · {totalHours}h
          </span>
          {allLocked ? (
            <span
              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full"
              style={{
                background: "var(--canvas-elevated)",
                color: "var(--ink-muted-60)",
                border: "1px solid var(--hairline)",
              }}
              title="This week is in the past — read only"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Past week · locked
            </span>
          ) : (
            <>
              <StatusBadge status={status} />
              <button
                onClick={onSave}
                disabled={status.kind === "saving"}
                className={`btn-primary px-5 py-2 text-[13px] ${status.kind === "saving" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {status.kind === "saving" ? "Saving…" : "Save week"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Per-employee weekly hours summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {EMPLOYEES.map((e) => {
          const hrs = hoursByEmployee.get(e) ?? 0;
          const numShifts = hrs / 5;
          const palette = PALETTE[e];
          // Visual fill of the hour bar, capped at 40h baseline
          const fill = Math.min(1, hrs / 40);
          return (
            <div
              key={e}
              className="relative rounded-[16px] p-4 overflow-hidden transition-all"
              style={{
                background: "var(--canvas)",
                border: "1px solid var(--hairline)",
                boxShadow: "var(--shadow-1)",
              }}
            >
              {/* Color wash for active employees */}
              {hrs > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.06]"
                  style={{ background: palette.bg }}
                />
              )}

              <div className="relative flex items-center gap-3">
                <Avatar employee={e} size={40} />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--ink)] tracking-[-0.011em] truncate">
                    {e}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-60)]">
                    {numShifts} {numShifts === 1 ? "shift" : "shifts"}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-semibold tracking-[-0.02em] tabular-nums leading-none"
                    style={{
                      fontSize: "26px",
                      color: hrs === 0 ? "var(--ink-muted-48)" : "var(--ink)",
                    }}
                  >
                    {hrs}
                  </div>
                  <div className="text-[10px] text-[var(--ink-muted-60)] mt-0.5">
                    hrs
                  </div>
                </div>
              </div>

              {/* Hour bar */}
              <div
                className="relative mt-3 h-[5px] rounded-full overflow-hidden"
                style={{ background: "var(--canvas-elevated)" }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${Math.max(fill * 100, hrs > 0 ? 6 : 0)}%`,
                    background: palette.bg,
                    transitionDuration: "var(--dur-3)",
                    transitionTimingFunction: "var(--ease-out-expo)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule grid */}
      <div
        className="overflow-x-auto rounded-[16px]"
        style={{
          background: "var(--canvas)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[var(--canvas)] z-10 px-5 py-4 text-left text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium border-b border-[var(--hairline)]">
                Employee
              </th>
              {weekDates.map((d, i) => {
                const isToday = d === today;
                const dt = new Date(d + "T00:00:00");
                return (
                  <th
                    key={d}
                    className="px-3 py-4 text-center text-[12px] font-semibold border-b border-[var(--hairline)] min-w-[110px]"
                    style={{
                      color: isToday ? "var(--primary)" : "var(--ink)",
                    }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-60)]">
                      {DAYS[i]}
                    </div>
                    <div className="mt-1 text-[14px] font-semibold tabular-nums">
                      {dt.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {EMPLOYEES.map((employee, rowIdx) => {
              const isLast = rowIdx === EMPLOYEES.length - 1;
              return (
                <tr key={employee}>
                  <td
                    className={`sticky left-0 bg-[var(--canvas)] z-10 px-4 py-3 ${isLast ? "" : "border-b border-[var(--hairline)]"}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-[140px]">
                      <Avatar employee={employee} size={30} />
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold tracking-[-0.011em] text-[var(--ink)] truncate">
                          {employee}
                        </div>
                        <div className="text-[10px] tabular-nums text-[var(--ink-muted-48)] mt-0.5">
                          {hoursByEmployee.get(employee) ?? 0}h this week
                        </div>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((date) => {
                    const shift = shiftMap.get(`${employee}|${date}`);
                    const isToday = date === today;
                    const locked = isLocked(date);
                    const isOpen =
                      editing?.employee === employee && editing?.date === date;
                    return (
                      <ScheduleCell
                        key={date}
                        date={date}
                        employee={employee}
                        shift={shift}
                        isToday={isToday}
                        locked={locked}
                        isOpen={isOpen}
                        isLastRow={isLast}
                        onOpen={() => setEditing({ employee, date })}
                        onPick={(t) => setShift(employee, date, t)}
                        onRemove={() => removeShift(employee, date)}
                        onClose={() => setEditing(null)}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Daily coverage strip */}
      <div
        className="rounded-[16px] overflow-hidden"
        style={{
          background: "var(--canvas)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="px-5 py-3 flex items-center gap-3 border-b border-[var(--hairline)]">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium">
            Daily coverage
          </div>
          <div className="ml-auto text-[11px] text-[var(--ink-muted-60)]">
            People working each day · max 4
          </div>
        </div>
        <div className="grid grid-cols-7">
          {weekDates.map((date, i) => {
            const working = EMPLOYEES.filter((e) =>
              shiftMap.has(`${e}|${date}`),
            );
            const count = working.length;
            const fill = count / EMPLOYEES.length;
            const isTodayCol = date === today;
            return (
              <div
                key={date}
                className={`p-3 text-center ${i < 6 ? "border-r border-[var(--hairline)]" : ""}`}
                style={{
                  background: isTodayCol ? "var(--primary-soft)" : "transparent",
                }}
              >
                <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-60)]">
                  {DAYS[i]}
                </div>
                <div className="mt-1.5 text-[18px] font-semibold tabular-nums leading-none"
                  style={{
                    color:
                      count === 0
                        ? "var(--ink-muted-48)"
                        : "var(--ink)",
                  }}
                >
                  {count}
                  <span className="text-[12px] text-[var(--ink-muted-48)] font-normal ml-0.5">
                    /4
                  </span>
                </div>
                {/* Stacked avatars of who's working */}
                <div className="mt-2 flex items-center justify-center min-h-[18px]">
                  {working.length === 0 ? (
                    <div className="w-2 h-2 rounded-full bg-[var(--canvas-elevated)] border border-[var(--hairline)]" />
                  ) : (
                    <div className="flex -space-x-1.5">
                      {working.map((e) => (
                        <span
                          key={e}
                          className="grid place-items-center rounded-full text-[8px] font-semibold text-white"
                          style={{
                            width: 18,
                            height: 18,
                            background: PALETTE[e].bg,
                            boxShadow: "0 0 0 2px var(--canvas)",
                          }}
                          title={e}
                        >
                          {initialsOf(e)[0]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Fill bar */}
                <div
                  className="mt-2 h-[3px] rounded-full overflow-hidden mx-auto"
                  style={{
                    background: "var(--canvas-elevated)",
                    width: "60%",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(fill * 100, count > 0 ? 12 : 0)}%`,
                      background:
                        count === 0
                          ? "var(--ink-muted-32)"
                          : count <= 1
                            ? "#f59e0b"
                            : count <= 3
                              ? "var(--primary)"
                              : "#22c55e",
                      transitionDuration: "var(--dur-3)",
                      transitionTimingFunction: "var(--ease-out-expo)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      <p className="text-[12px] text-[var(--ink-muted-48)] leading-[1.5]">
        Tip: shifts are 5 hours. Click a cell to add a shift, click an existing
        shift to change its start time or remove it. Don&apos;t forget to{" "}
        <strong>Save week</strong> when you&apos;re done.
      </p>

      <style>{`
        .mm-shift {
          transition: transform 250ms var(--ease-out-expo),
                      box-shadow 250ms var(--ease-out-expo);
          will-change: transform;
        }
        .mm-shift:hover {
          transform: translateY(-2px) scale(1.04);
        }
        .mm-shift:active {
          transform: scale(0.98);
        }
        .mm-shift-sheen {
          opacity: 0;
          transform: translateX(-110%);
          transition: opacity 220ms var(--ease-out-expo),
                      transform 800ms var(--ease-out-expo);
        }
        .mm-shift:hover .mm-shift-sheen {
          opacity: 1;
          transform: translateX(110%);
        }
        .mm-shift-locked {
          transition: opacity 180ms var(--ease-out-expo);
        }
        .mm-empty {
          transition: all 200ms var(--ease-out-expo);
        }
        .mm-empty:hover {
          transform: scale(1.02);
        }
        @keyframes mm-shift-pop {
          from { opacity: 0; transform: scale(0.96) translateY(2px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .mm-shift, .mm-shift-locked {
          animation: mm-shift-pop 280ms var(--ease-out-expo) both;
        }
      `}</style>
    </div>
  );
}

function ScheduleCell({
  date,
  employee,
  shift,
  isToday,
  locked,
  isOpen,
  isLastRow,
  onOpen,
  onPick,
  onRemove,
  onClose,
}: {
  date: string;
  employee: Employee;
  shift?: Shift;
  isToday: boolean;
  locked: boolean;
  isOpen: boolean;
  isLastRow: boolean;
  onOpen: () => void;
  onPick: (start: string) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const palette = PALETTE[employee];

  return (
    <td
      ref={cellRef}
      className={`relative px-2 py-2 align-middle ${isLastRow ? "" : "border-b border-[var(--hairline)]"}`}
      style={{
        background: isToday
          ? "var(--primary-soft)"
          : locked
            ? "var(--canvas-sunken)"
            : "transparent",
      }}
    >
      {shift ? (
        locked ? (
          <div
            className="w-full rounded-[10px] px-2.5 py-2 text-left mm-shift-locked"
            style={{
              background: "var(--canvas-elevated)",
              color: "var(--ink-muted-60)",
              border: "1px solid var(--hairline)",
              borderLeft: `3px solid ${palette.hue}`,
            }}
            title="Past shift · locked"
          >
            <div className="text-[12px] font-semibold tabular-nums">
              {formatTime12h(shift.startTime)}
            </div>
            <div className="text-[10px] tabular-nums text-[var(--ink-muted-48)]">
              → {formatTime12h(endOfShift(shift.startTime))}
            </div>
          </div>
        ) : (
          <button
            onClick={onOpen}
            className="mm-shift relative w-full rounded-[10px] px-2.5 py-2 text-left overflow-hidden"
            style={{
              background: palette.bg,
              color: "white",
              boxShadow: `0 1px 2px ${palette.ring}, 0 4px 14px ${palette.ring}`,
            }}
          >
            {/* sheen on hover */}
            <span
              aria-hidden="true"
              className="mm-shift-sheen absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
              }}
            />
            <div className="relative text-[12px] font-semibold tabular-nums">
              {formatTime12h(shift.startTime)}
            </div>
            <div className="relative text-[10px] tabular-nums opacity-85">
              → {formatTime12h(endOfShift(shift.startTime))}
            </div>
          </button>
        )
      ) : locked ? (
        <div
          className="w-full h-[44px] flex items-center justify-center text-[var(--ink-muted-32)]"
          aria-label="Past day, no shift"
        >
          —
        </div>
      ) : (
        <button
          onClick={onOpen}
          className="mm-empty group w-full h-[44px] rounded-[10px] text-[14px] transition-all flex items-center justify-center"
          style={{
            border: "1px dashed var(--hairline-strong)",
            color: "var(--ink-muted-48)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = palette.hue;
            e.currentTarget.style.background = palette.soft;
            e.currentTarget.style.color = palette.hue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--hairline-strong)";
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--ink-muted-48)";
          }}
        >
          +
        </button>
      )}

      {isOpen && !locked && (
        <ShiftPicker
          anchorRef={cellRef}
          currentStart={shift?.startTime}
          dateLabel={date}
          onPick={onPick}
          onRemove={shift ? onRemove : undefined}
          onClose={onClose}
        />
      )}
    </td>
  );
}

function ShiftPicker({
  anchorRef,
  currentStart,
  dateLabel,
  onPick,
  onRemove,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  currentStart?: string;
  dateLabel?: string;
  onPick: (start: string) => void;
  onRemove?: () => void;
  onClose: () => void;
}) {
  const [custom, setCustom] = useState(currentStart ?? "");
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const POP_W = 224;

  // Compute position: center horizontally on the anchor cell, prefer below
  // but flip above if there's not enough room. Clamp to viewport edges.
  useEffect(() => {
    const compute = () => {
      const a = anchorRef.current;
      if (!a) return;
      const r = a.getBoundingClientRect();
      const popH = popRef.current?.offsetHeight ?? 200;
      const margin = 8;
      const vpH = window.innerHeight;
      const vpW = window.innerWidth;

      // Vertical: open below if room, otherwise above
      let top = r.bottom + 4;
      if (top + popH + margin > vpH) {
        top = Math.max(margin, r.top - popH - 4);
      }

      // Horizontal: center on cell, clamp to viewport
      const cellCenter = r.left + r.width / 2;
      let left = cellCenter - POP_W / 2;
      if (left < margin) left = margin;
      if (left + POP_W + margin > vpW) left = vpW - POP_W - margin;

      setPos({ top, left });
    };
    compute();
    // Recompute on scroll/resize so the popover tracks the cell
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [anchorRef]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop closes the popover */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={popRef}
        role="dialog"
        aria-label={dateLabel ? `Edit shift for ${dateLabel}` : "Edit shift"}
        className="fixed z-[101] rounded-[14px] p-3 space-y-2"
        style={{
          width: POP_W,
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          visibility: pos ? "visible" : "hidden",
          background: "var(--canvas)",
          border: "1px solid var(--hairline-strong)",
          boxShadow: "var(--shadow-3)",
        }}
      >
        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium px-1">
          Start time (5h shift)
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {DEFAULT_START_TIMES.map((t) => {
            const active = currentStart === t;
            return (
              <button
                key={t}
                onClick={() => onPick(t)}
                className="rounded-full px-2 py-1.5 text-[12px] font-semibold tabular-nums transition-colors"
                style={{
                  background: active ? "var(--ink)" : "var(--canvas-elevated)",
                  color: active ? "var(--on-dark)" : "var(--ink)",
                  border: `1px solid ${active ? "var(--ink)" : "var(--hairline)"}`,
                }}
              >
                {formatTime12h(t)}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="time"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="flex-1 rounded-md px-2 py-1.5 text-[12px] tabular-nums"
            style={{
              background: "var(--canvas-elevated)",
              border: "1px solid var(--hairline)",
              color: "var(--ink)",
            }}
            placeholder="Custom"
          />
          <button
            onClick={() => custom && onPick(custom)}
            disabled={!custom || !/^\d{2}:\d{2}$/.test(custom)}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
            style={{
              background: "var(--primary)",
              color: "var(--on-primary)",
              opacity: !custom || !/^\d{2}:\d{2}$/.test(custom) ? 0.5 : 1,
            }}
          >
            Set
          </button>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="w-full rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors"
            style={{
              background: "var(--canvas-elevated)",
              color: "#dc2626",
              border: "1px solid var(--hairline)",
            }}
          >
            Remove shift
          </button>
        )}
      </div>
    </>,
    document.body,
  );
}

function Avatar({
  employee,
  size = 28,
}: {
  employee: Employee;
  size?: number;
}) {
  const palette = PALETTE[employee];
  return (
    <div
      className="grid place-items-center rounded-full text-white shrink-0 font-semibold tracking-[-0.01em]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: palette.bg,
        boxShadow: `0 0 0 2px ${palette.soft}, 0 1px 2px ${palette.ring}`,
      }}
      aria-hidden="true"
    >
      {initialsOf(employee)}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status.kind === "saved")
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full"
        style={{
          background: "rgba(34, 197, 94, 0.10)",
          color: "#15803d",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#22c55e" }}
        />
        Saved
      </span>
    );
  if (status.kind === "error")
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full"
        style={{
          background: "rgba(239, 68, 68, 0.10)",
          color: "#b91c1c",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#ef4444" }}
        />
        {status.message}
      </span>
    );
  return null;
}
