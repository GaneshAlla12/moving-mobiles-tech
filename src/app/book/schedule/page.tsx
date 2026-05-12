"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/components/booking/BookingProvider";
import BookingNav from "@/components/booking/BookingNav";
import DateTimePicker from "@/components/booking/DateTimePicker";

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
