"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBooking } from "./BookingProvider";
import {
  deviceLabelFor,
  deviceTypes,
} from "@/lib/booking";
import { business } from "@/lib/business";
import StoreHoursCard from "@/components/StoreHoursCard";

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
          <li
            className={`flex items-start gap-2.5 ${
              pathname === "/book/contact"
                ? "text-[var(--ink)] font-semibold"
                : hasContact
                  ? "text-[var(--ink-muted-80)]"
                  : "text-[var(--ink-muted-48)]"
            }`}
          >
            <span className="grid h-5 w-5 place-items-center text-current shrink-0 mt-px">
              <ChatIcon />
            </span>
            <span className="min-w-0">
              <span className="block truncate">
                {hasContact ? state.contact.name : "Contact details"}
              </span>
              <a
                href={`tel:${business.contact.phone}`}
                className="block mt-0.5 text-[12.5px] font-normal text-[var(--ink-muted-60)] hover:text-[var(--primary)] tabular-nums transition-colors"
              >
                {business.contact.phoneDisplay}
              </a>
            </span>
          </li>
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
