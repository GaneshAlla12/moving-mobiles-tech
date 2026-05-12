"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/components/booking/BookingProvider";
import BookingNav from "@/components/booking/BookingNav";
import DateTimePicker from "@/components/booking/DateTimePicker";
import { shopHoursDisplay } from "@/lib/booking";

export default function StepSchedule() {
  const router = useRouter();
  const { state, hydrated, setField } = useBooking();

  useEffect(() => {
    if (!hydrated) return;
    if (!state.deviceType) router.replace("/book");
    else if (state.issues.length === 0 && state.deviceType !== "other") {
      router.replace("/book/issue");
    }
  }, [hydrated, state, router]);

  if (!hydrated || !state.deviceType) return null;

  const onChange = (date: string | undefined, time: string | undefined) => {
    setField("date", date);
    setField("time", time);
  };

  return (
    <>
      <h1
        className="font-semibold leading-[1.07] tracking-[-0.005em]"
        style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
      >
        When works for you?
      </h1>
      <p className="mt-3 text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
        Pick a day and time. Most repairs are done same day — many while you wait.
      </p>

      <div className="mt-8">
        <DateTimePicker
          date={state.date}
          time={state.time}
          onChange={onChange}
        />
      </div>

      {/* Store hours */}
      <div
        className="mt-6 rounded-[16px] overflow-hidden"
        style={{
          background: "var(--canvas)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="px-5 py-3 flex items-center gap-2 border-b border-[var(--hairline)]">
          <span
            className="grid place-items-center w-7 h-7 rounded-full shrink-0"
            style={{
              background: "var(--primary-soft)",
              color: "var(--primary)",
            }}
            aria-hidden="true"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-60)] font-medium">
            Store hours
          </div>
        </div>
        <dl className="divide-y divide-[var(--hairline)]">
          {shopHoursDisplay.map((row) => (
            <div
              key={row.days}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <dt className="text-[14px] font-medium text-[var(--ink)]">
                {row.days}
              </dt>
              <dd className="text-[14px] tabular-nums text-[var(--ink-muted-80)]">
                {row.hours}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-12">
        <BookingNav
          backHref="/book/issue"
          nextHref="/book/contact"
          nextDisabled={!state.date || !state.time}
        />
      </div>
    </>
  );
}
