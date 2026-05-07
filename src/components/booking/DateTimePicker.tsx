"use client";

import { useMemo, useState } from "react";
import {
  generateTimeSlots,
  isOpenOn,
  formatTime12h,
  shopHours,
} from "@/lib/booking";

type Props = {
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  onChange: (date: string | undefined, time: string | undefined) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(viewMonth: Date): Date[][] {
  // 6 rows × 7 cols. Pads from previous month so the first cell is Sunday.
  const first = startOfMonth(viewMonth);
  const startDay = first.getDay(); // 0 = Sun
  const start = new Date(first);
  start.setDate(first.getDate() - startDay);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d));
    }
    weeks.push(row);
  }
  return weeks;
}

export default function DateTimePicker({ date, time, onChange }: Props) {
  // Today at local midnight
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const horizon = useMemo(() => {
    const h = new Date(today);
    h.setDate(today.getDate() + shopHours.bookingHorizonDays);
    return h;
  }, [today]);

  const initialView = useMemo(() => {
    if (date) {
      const [y, m] = date.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return startOfMonth(today);
  }, [date, today]);

  const [viewMonth, setViewMonth] = useState<Date>(initialView);

  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  const selectedDate = useMemo(() => {
    if (!date) return null;
    const [y, m, d] = date.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [date]);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    const all = generateTimeSlots(selectedDate);
    // If selected is today, hide past slots (give 1h lead)
    if (isSameDay(selectedDate, today)) {
      const now = new Date();
      const cutoffMin = now.getHours() * 60 + now.getMinutes() + 60;
      return all.filter((s) => {
        const [h, m] = s.split(":").map(Number);
        return h * 60 + m >= cutoffMin;
      });
    }
    return all;
  }, [selectedDate, today]);

  const canPrev = viewMonth.getFullYear() > today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() &&
      viewMonth.getMonth() > today.getMonth());

  const horizonMonth = startOfMonth(horizon);
  const canNext = viewMonth.getFullYear() < horizonMonth.getFullYear() ||
    (viewMonth.getFullYear() === horizonMonth.getFullYear() &&
      viewMonth.getMonth() < horizonMonth.getMonth());

  const goPrev = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const goNext = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  const onPickDate = (d: Date) => {
    onChange(toIso(d), undefined);
  };

  const onPickTime = (t: string) => {
    if (!date) return;
    onChange(date, t);
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      {/* Calendar */}
      <div className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)] p-5">
        <div className="flex items-center justify-between">
          <div className="text-[17px] font-semibold tracking-[-0.011em]">
            {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Previous month"
              className={`grid h-9 w-9 place-items-center rounded-full border border-[var(--hairline)] ${canPrev ? "hover:border-[var(--ink)] text-[var(--ink)]" : "text-[var(--ink-muted-48)] opacity-50 cursor-not-allowed"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next month"
              className={`grid h-9 w-9 place-items-center rounded-full border border-[var(--hairline)] ${canNext ? "hover:border-[var(--ink)] text-[var(--ink)]" : "text-[var(--ink-muted-48)] opacity-50 cursor-not-allowed"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[12px] text-[var(--ink-muted-48)]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.flat().map((d, i) => {
            const inMonth = d.getMonth() === viewMonth.getMonth();
            const past = d < today;
            const beyond = d > horizon;
            const closed = !isOpenOn(d);
            const disabled = past || beyond || closed || !inMonth;
            const selected = selectedDate && isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);

            return (
              <button
                key={i}
                onClick={() => !disabled && onPickDate(d)}
                disabled={disabled}
                className={[
                  "relative aspect-square rounded-full text-[14px] transition-colors",
                  selected
                    ? "bg-[var(--ink)] text-white font-semibold"
                    : disabled
                      ? "text-[var(--ink-muted-48)] opacity-40 cursor-not-allowed"
                      : "hover:bg-[var(--surface)] text-[var(--ink)]",
                  isToday && !selected ? "ring-1 ring-[var(--primary)]/40" : "",
                ].join(" ")}
              >
                <span className="relative z-10">{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-[12px] text-[var(--ink-muted-48)]">
          <span className="flex items-center gap-1.5">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--ink)]"></span>
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="grid h-4 w-4 place-items-center rounded-full ring-1 ring-[var(--primary)]/40"></span>
            Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="opacity-40">Sun</span>
            Closed
          </span>
        </div>
      </div>

      {/* Time slots */}
      <div className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)] p-5">
        <div className="text-[17px] font-semibold tracking-[-0.011em]">
          Available times
        </div>
        {!selectedDate ? (
          <p className="mt-4 text-[14px] text-[var(--ink-muted-48)]">
            Pick a date to see available time slots.
          </p>
        ) : slots.length === 0 ? (
          <p className="mt-4 text-[14px] text-[var(--ink-muted-48)]">
            No slots available on this day. Try another date.
          </p>
        ) : (
          <>
            <div className="mt-1 text-[13px] text-[var(--ink-muted-48)]">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {slots.map((s) => {
                const isSel = time === s;
                return (
                  <button
                    key={s}
                    onClick={() => onPickTime(s)}
                    className={[
                      "rounded-full px-3 py-2 text-[14px] border transition-colors",
                      isSel
                        ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                        : "border-[var(--hairline)] hover:border-[var(--ink)] text-[var(--ink)]",
                    ].join(" ")}
                  >
                    {formatTime12h(s)}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
