"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBooking } from "@/components/booking/BookingProvider";
import {
  deviceLabelFor,
  formatDateLong,
  formatTime12h,
} from "@/lib/booking";
import { business } from "@/lib/business";

export default function Confirmation() {
  const router = useRouter();
  const { state, reset } = useBooking();
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const ref = sessionStorage.getItem("mm-booking-ref");
    if (!ref) {
      router.replace("/book");
      return;
    }
    setReference(ref);
  }, [router]);

  if (!reference) return null;

  const deviceLabel = deviceLabelFor(state);

  const onBookAnother = () => {
    sessionStorage.removeItem("mm-booking-ref");
    reset();
    router.push("/book");
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-[var(--primary)] text-white">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1
        className="mt-6 font-semibold leading-[1.07] tracking-[-0.005em]"
        style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
      >
        You&apos;re all set, {state.contact.name.split(" ")[0] || "there"}.
      </h1>
      <p className="mt-3 text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
        We&apos;ve got your appointment booked. A confirmation will be sent to{" "}
        <span className="text-[var(--ink)] font-semibold">
          {state.contact.email || "your email"}
        </span>
        .
      </p>

      <div className="mt-8 rounded-[18px] border border-[var(--hairline)] bg-[var(--surface)] p-6 text-left">
        <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
          Reference
        </div>
        <div className="mt-1 text-[19px] font-semibold tracking-[-0.011em]">
          {reference}
        </div>

        <div className="mt-5 border-t border-[var(--hairline)] pt-5">
          <dl className="space-y-3 text-[15px]">
            <Row k="Device">{deviceLabel}</Row>
            <Row k="Issue">
              {state.issues.length ? state.issues.join(", ") : "Free diagnostic"}
            </Row>
            {state.description && <Row k="Notes">{state.description}</Row>}
            <Row k="When">
              {state.date && state.time
                ? `${formatDateLong(state.date)} · ${formatTime12h(state.time)}`
                : "—"}
            </Row>
            <Row k="Where">
              {business.contact.address.street},{" "}
              {business.contact.address.city}, {business.contact.address.state}
            </Row>
          </dl>
        </div>
      </div>

      <p className="mt-6 text-[14px] text-[var(--ink-muted-48)]">
        Need to change something? Call{" "}
        <a
          href={`tel:${business.contact.phone}`}
          className="text-[var(--primary)] hover:underline"
        >
          {business.contact.phoneDisplay}
        </a>{" "}
        and reference{" "}
        <span className="text-[var(--ink)] font-semibold">{reference}</span>.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-secondary px-6 py-2.5 text-[15px]">
          Back to home
        </Link>
        <button
          onClick={onBookAnother}
          className="btn-primary px-6 py-2.5 text-[15px]"
        >
          Book another repair
        </button>
      </div>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
      <dt className="w-24 shrink-0 text-[var(--ink-muted-48)]">{k}</dt>
      <dd className="text-[var(--ink)]">{children}</dd>
    </div>
  );
}
