"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/components/booking/BookingProvider";
import BookingNav from "@/components/booking/BookingNav";
import { issuesByDevice } from "@/lib/booking";

const MAX_DESC = 500;

export default function StepIssue() {
  const router = useRouter();
  const { state, hydrated, setField } = useBooking();

  const issues = useMemo(
    () => (state.deviceType ? issuesByDevice[state.deviceType] : []),
    [state.deviceType],
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!state.deviceType) router.replace("/book");
  }, [hydrated, state.deviceType, router]);

  if (!hydrated || !state.deviceType) return null;

  const isOther = state.deviceType === "other";

  const toggle = (issue: string) => {
    const has = state.issues.includes(issue);
    setField("issues", has ? state.issues.filter((i) => i !== issue) : [...state.issues, issue]);
  };

  const canContinue =
    state.issues.length > 0 ||
    (isOther && (state.customDevice ?? "").trim().length > 0);

  return (
    <>
      <h1
        className="font-semibold leading-[1.07] tracking-[-0.005em]"
        style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
      >
        What&apos;s wrong with it?
      </h1>
      <p className="mt-3 text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
        Things happen — we&apos;ve seen it all. Pick all that apply.
      </p>

      {isOther && (
        <div className="mt-6 max-w-xl">
          <label className="block">
            <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
              What kind of device is it?
            </span>
            <input
              type="text"
              value={state.customDevice ?? ""}
              onChange={(e) => setField("customDevice", e.target.value)}
              placeholder="e.g., Apple Watch Series 9, DJI Mini 4 Pro, AirPods Pro"
              className="mt-2 w-full rounded-[11px] border border-[var(--hairline)] bg-[var(--canvas)] px-4 py-3 text-[15px] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-soft)]"
            />
          </label>
        </div>
      )}

      <div className="mt-8 max-w-xl space-y-3">
        {issues.map((issue) => {
          const checked = state.issues.includes(issue);
          return (
            <label
              key={issue}
              className={`flex items-center gap-3 rounded-[14px] border ${checked ? "border-[var(--ink)] bg-[var(--surface)]" : "border-[var(--hairline)] bg-[var(--canvas)]"} px-4 py-3.5 cursor-pointer hover:border-[var(--ink-muted-48)]`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(issue)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`grid h-5 w-5 place-items-center rounded-[5px] border-2 ${checked ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--hairline)]"}`}
              >
                {checked && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span className="text-[15px]">{issue}</span>
            </label>
          );
        })}
      </div>

      <div className="mt-6 max-w-xl">
        <label className="block">
          <span className="sr-only">Describe the issue</span>
          <textarea
            value={state.description}
            onChange={(e) =>
              setField(
                "description",
                e.target.value.slice(0, MAX_DESC),
              )
            }
            rows={4}
            placeholder="Describe the issue (optional)"
            className="w-full rounded-[14px] border border-[var(--hairline)] bg-[var(--canvas)] px-4 py-3 text-[15px] resize-y focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-soft)]"
          />
          <div className="mt-1 text-right text-[12px] text-[var(--ink-muted-48)]">
            {state.description.length}/{MAX_DESC}
          </div>
        </label>
      </div>

      <div className="mt-12">
        <BookingNav
          backHref={isOther ? "/book" : "/book/model"}
          nextHref="/book/schedule"
          nextDisabled={!canContinue}
        />
      </div>
    </>
  );
}
