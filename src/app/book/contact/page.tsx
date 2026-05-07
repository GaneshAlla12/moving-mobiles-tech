"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/components/booking/BookingProvider";
import BookingNav from "@/components/booking/BookingNav";
import {
  deviceLabelFor,
  formatDateLong,
  formatTime12h,
} from "@/lib/booking";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\-+()\s.]{7,}$/;

export default function StepContact() {
  const router = useRouter();
  const { state, hydrated, setField } = useBooking();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.deviceType) router.replace("/book");
    else if (!state.date || !state.time) router.replace("/book/schedule");
  }, [hydrated, state, router]);

  const valid = useMemo(() => {
    return (
      state.contact.name.trim().length >= 2 &&
      EMAIL_RE.test(state.contact.email.trim()) &&
      PHONE_RE.test(state.contact.phone.trim())
    );
  }, [state.contact]);

  const setContact = (key: "name" | "email" | "phone", value: string) => {
    setField("contact", { ...state.contact, [key]: value });
  };

  const onSubmit = async () => {
    if (!valid || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(state),
      });
      const json = await res.json();
      if (!res.ok || !json.reference) {
        throw new Error(json.error || "Could not submit booking");
      }
      // Stash reference and route to confirmation
      sessionStorage.setItem("mm-booking-ref", json.reference);
      router.push("/book/confirmation");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (!hydrated || !state.deviceType || !state.date || !state.time) return null;

  const deviceLabel = deviceLabelFor(state);

  return (
    <>
      <h1
        className="font-semibold leading-[1.07] tracking-[-0.005em]"
        style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
      >
        Your contact details
      </h1>
      <p className="mt-3 text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
        We&apos;ll send a confirmation with your appointment details.
      </p>

      <div className="mt-8 max-w-xl space-y-5">
        <Field label="Full name">
          <input
            type="text"
            value={state.contact.name}
            onChange={(e) => setContact("name", e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            className="mm-input"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={state.contact.email}
            onChange={(e) => setContact("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="mm-input"
          />
        </Field>
        <Field label="Mobile phone">
          <input
            type="tel"
            value={state.contact.phone}
            onChange={(e) => setContact("phone", e.target.value)}
            placeholder="(203) 555-0123"
            autoComplete="tel"
            className="mm-input"
          />
        </Field>
      </div>

      {/* Confirmation summary */}
      <div className="mt-10 rounded-[18px] border border-[var(--hairline)] bg-[var(--surface)] p-6 max-w-xl">
        <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
          You&apos;re booking
        </div>
        <dl className="mt-4 space-y-3 text-[15px]">
          <Row k="Device">{deviceLabel}</Row>
          <Row k="Issue">{state.issues.join(", ") || "Free diagnostic"}</Row>
          <Row k="When">
            {formatDateLong(state.date)} · {formatTime12h(state.time)}
          </Row>
          <Row k="Where">
            13 Danbury Rd, Wilton, CT 06897
          </Row>
        </dl>
      </div>

      {error && (
        <p className="mt-6 text-[14px] text-red-600">{error}</p>
      )}

      <div className="mt-10">
        <BookingNav
          backHref="/book/schedule"
          nextLabel={submitting ? "Confirming…" : "Confirm appointment"}
          nextDisabled={!valid || submitting}
          onNext={onSubmit}
        />
      </div>

      <style>{`
        .mm-input {
          width: 100%;
          background: var(--canvas);
          color: var(--ink);
          border: 1px solid var(--hairline);
          border-radius: 11px;
          padding: 14px 16px;
          font-size: 15px;
          letter-spacing: -0.022em;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .mm-input::placeholder { color: var(--ink-muted-48); }
        .mm-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
      `}</style>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
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
