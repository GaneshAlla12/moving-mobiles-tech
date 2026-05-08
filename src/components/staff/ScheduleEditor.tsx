"use client";

import { useMemo, useState } from "react";
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
          const dot =
            hrs === 0
              ? "var(--ink-muted-32)"
              : hrs < 20
                ? "#f59e0b"
                : hrs <= 40
                  ? "#22c55e"
                  : "#ef4444";
          return (
            <div
              key={e}
              className="rounded-[14px] px-4 py-3"
              style={{
                background: "var(--canvas)",
                border: "1px solid var(--hairline)",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-60)] font-medium">
                  {e}
                </div>
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: dot }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span
                  className="font-semibold tracking-[-0.02em] tabular-nums"
                  style={{
                    fontSize: "26px",
                    color: hrs === 0 ? "var(--ink-muted-48)" : "var(--ink)",
                  }}
                >
                  {hrs}
                </span>
                <span className="text-[12px] text-[var(--ink-muted-60)]">
                  hrs
                </span>
                <span className="ml-auto text-[11px] text-[var(--ink-muted-48)] tabular-nums">
                  {numShifts} {numShifts === 1 ? "shift" : "shifts"}
                </span>
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
                    className={`sticky left-0 bg-[var(--canvas)] z-10 px-5 py-4 text-[14px] font-semibold ${isLast ? "" : "border-b border-[var(--hairline)]"}`}
                    style={{ color: "var(--ink)" }}
                  >
                    {employee}
                  </td>
                  {weekDates.map((date) => {
                    const shift = shiftMap.get(`${employee}|${date}`);
                    const isToday = date === today;
                    const locked = isLocked(date);
                    const isOpen =
                      editing?.employee === employee && editing?.date === date;
                    return (
                      <td
                        key={date}
                        className={`relative px-2 py-2 align-middle ${isLast ? "" : "border-b border-[var(--hairline)]"}`}
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
                            // Read-only completed shift
                            <div
                              className="w-full rounded-[10px] px-2.5 py-2 text-left"
                              style={{
                                background: "var(--canvas-elevated)",
                                color: "var(--ink-muted-60)",
                                border: "1px solid var(--hairline)",
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
                              onClick={() => setEditing({ employee, date })}
                              className="w-full rounded-[10px] px-2.5 py-2 text-left transition-all hover:scale-[1.02]"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--primary) 0%, var(--primary-focus) 100%)",
                                color: "white",
                                boxShadow:
                                  "0 1px 2px rgba(0, 113, 227, 0.18), 0 4px 12px rgba(0, 113, 227, 0.18)",
                              }}
                            >
                              <div className="text-[12px] font-semibold tabular-nums">
                                {formatTime12h(shift.startTime)}
                              </div>
                              <div className="text-[10px] tabular-nums opacity-80">
                                → {formatTime12h(endOfShift(shift.startTime))}
                              </div>
                            </button>
                          )
                        ) : locked ? (
                          // Empty past cell — neutral, no add button
                          <div
                            className="w-full h-[44px] flex items-center justify-center text-[var(--ink-muted-32)]"
                            aria-label="Past day, no shift"
                          >
                            —
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditing({ employee, date })}
                            className="w-full h-[44px] rounded-[10px] text-[12px] transition-colors flex items-center justify-center"
                            style={{
                              border: "1px dashed var(--hairline)",
                              color: "var(--ink-muted-48)",
                            }}
                          >
                            +
                          </button>
                        )}

                        {/* Inline picker — only opens for editable cells */}
                        {isOpen && !locked && (
                          <ShiftPicker
                            currentStart={shift?.startTime}
                            onPick={(t) => setShift(employee, date, t)}
                            onRemove={
                              shift
                                ? () => removeShift(employee, date)
                                : undefined
                            }
                            onClose={() => setEditing(null)}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Help text */}
      <p className="text-[12px] text-[var(--ink-muted-48)] leading-[1.5]">
        Tip: shifts are 5 hours. Click a cell to add a shift, click an existing
        shift to change its start time or remove it. Don&apos;t forget to{" "}
        <strong>Save week</strong> when you&apos;re done.
      </p>
    </div>
  );
}

function ShiftPicker({
  currentStart,
  onPick,
  onRemove,
  onClose,
}: {
  currentStart?: string;
  onPick: (start: string) => void;
  onRemove?: () => void;
  onClose: () => void;
}) {
  const [custom, setCustom] = useState(currentStart ?? "");

  return (
    <>
      {/* Backdrop to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 w-56 rounded-[14px] p-3 space-y-2"
        style={{
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
    </>
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
        Saved {status.at}
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
