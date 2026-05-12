"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBooking } from "./BookingProvider";
import {
  deviceLabelFor,
  deviceTypes,
  formatDateLong,
  formatTime12h,
  getOpenStatus,
  shopHoursDisplay,
} from "@/lib/booking";

const STEPS = [
  { path: "/book", label: "Device" },
  { path: "/book/brand", label: "Brand" },
  { path: "/book/model", label: "Model" },
  { path: "/book/issue", label: "Issue" },
  { path: "/book/schedule", label: "Date & time" },
  { path: "/book/contact", label: "Contact" },
];

export default function BookingSidebar() {
  const { state } = useBooking();
  const pathname = usePathname();

  const deviceFull = state.deviceType ? deviceLabelFor(state) : null;
  const issueSummary =
    state.issues.length > 0 ? state.issues.join(", ") : null;

  const currentIdx = STEPS.findIndex((s) => s.path === pathname);
  const isConfirmation = pathname === "/book/confirmation";

  // Step icons highlight what's already locked in.
  const hasLocation = true; // always Wilton
  const hasDateTime = Boolean(state.date && state.time);
  const hasContact =
    state.contact.name.trim() && state.contact.email.trim();

  return (
    <aside className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)] p-6 sticky top-24">
      <div className="text-[19px] font-semibold tracking-[-0.011em]">
        Summary
      </div>

      <div className="mt-5 space-y-4">
        {state.deviceType ? (
          <SummaryRow
            label={issueSummary || "Device repair"}
            sub={deviceFull}
            changeHref="/book"
          />
        ) : (
          <div className="text-[14px] text-[var(--ink-muted-48)]">
            Tell us a bit about your device — it takes about a minute.
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-[var(--hairline)] pt-6">
        <div className="text-[15px] font-semibold tracking-[-0.011em]">
          Visit details
        </div>
        <ul className="mt-4 space-y-3 text-[14px]">
          <SidebarStep
            icon={<PinIcon />}
            label="Wilton, CT"
            done={hasLocation}
          />
          <SidebarStep
            icon={<ClockIcon />}
            label={
              hasDateTime
                ? `${formatDateLong(state.date!).split(",")[0]} · ${formatTime12h(state.time!)}`
                : "Date and time"
            }
            done={hasDateTime}
            current={pathname === "/book/schedule"}
          />
          <SidebarStep
            icon={<ChatIcon />}
            label={hasContact ? state.contact.name : "Contact details"}
            done={Boolean(hasContact)}
            current={pathname === "/book/contact"}
          />
        </ul>
      </div>

      <div className="mt-8 border-t border-[var(--hairline)] pt-6">
        <StoreHoursCard />
      </div>

      <div className="mt-8 border-t border-[var(--hairline)] pt-6">
        <div className="text-[15px] font-semibold tracking-[-0.011em]">
          About our repairs
        </div>
        <ul className="mt-4 space-y-2.5 text-[14px] text-[var(--ink-muted-80)]">
          <CheckLine>90-day warranty</CheckLine>
          <CheckLine>Same-day on most fixes</CheckLine>
          <CheckLine>Free diagnostics</CheckLine>
          <CheckLine>No fix, no fee</CheckLine>
        </ul>
      </div>

      {!isConfirmation && currentIdx >= 0 && (
        <div className="mt-8 text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
          Step {currentIdx + 1} of {STEPS.length} · {STEPS[currentIdx]?.label}
        </div>
      )}

      {/* Hidden helper */}
      <span className="sr-only" aria-hidden>
        {state.deviceType
          ? deviceTypes.find((d) => d.key === state.deviceType)?.label
          : ""}
      </span>
    </aside>
  );
}

function SummaryRow({
  label,
  sub,
  changeHref,
}: {
  label: string;
  sub: string | null;
  changeHref: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-[15px] font-semibold tracking-[-0.011em]">
          {label}
        </div>
        {sub && (
          <div className="mt-0.5 text-[13px] text-[var(--ink-muted-48)]">
            {sub}
          </div>
        )}
      </div>
      <Link
        href={changeHref}
        className="text-[13px] text-[var(--primary)] hover:underline shrink-0"
      >
        Change
      </Link>
    </div>
  );
}

function SidebarStep({
  icon,
  label,
  done,
  current,
}: {
  icon: React.ReactNode;
  label: string;
  done?: boolean;
  current?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-2.5 ${
        current
          ? "text-[var(--ink)] font-semibold"
          : done
          ? "text-[var(--ink-muted-80)]"
          : "text-[var(--ink-muted-48)]"
      }`}
    >
      <span className="grid h-5 w-5 place-items-center text-current shrink-0">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </li>
  );
}

function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        className="mt-1 shrink-0 text-[var(--ink)]"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function StoreHoursCard() {
  // Compute the open/closed state client-side so the pill is live.
  // Re-tick every minute so it stays accurate without a page refresh.
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

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
