"use client";

import { useEffect } from "react";
import { business } from "@/lib/business";

type Props = {
  open: boolean;
  onClose: () => void;
  serviceTitle?: string;
};

export default function BookingModal({ open, onClose, serviceTitle }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const calendlyHref = serviceTitle
    ? `${business.calendlyUrl}?a1=${encodeURIComponent(`Service requested: ${serviceTitle}`)}`
    : business.calendlyUrl;

  const isPlaceholder = business.calendlyUrl.includes("your-link");

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[var(--hairline)] px-6 py-5">
          <div>
            <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
              Book an appointment
            </div>
            <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.011em]">
              {serviceTitle ? serviceTitle : "Repair Appointment"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-[var(--ink-muted-48)] hover:text-[var(--ink)] hover:bg-[var(--surface)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isPlaceholder ? (
            <div className="rounded-[18px] border border-[var(--hairline)] bg-[var(--surface)] p-6 text-[15px]">
              <div className="text-[var(--primary)] text-[14px] font-semibold tracking-[-0.011em]">
                Calendly setup pending
              </div>
              <p className="mt-2 text-[var(--ink-muted-80)] leading-[1.5]">
                Once the Calendly link is added in{" "}
                <code className="rounded bg-[var(--canvas)] border border-[var(--hairline)] px-1.5 py-0.5 text-[13px] font-mono">
                  src/lib/business.ts
                </code>
                , this modal will load the live booking widget with real
                available slots.
              </p>
              <p className="mt-4 text-[14px] text-[var(--ink-muted-48)]">
                The booking form will collect:
              </p>
              <ul className="mt-2 space-y-1 text-[14px] text-[var(--ink-muted-80)]">
                <li>• Name &amp; email</li>
                <li>• Available time slot from your live calendar</li>
                <li>• A description of the device problem</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`tel:${business.contact.phone}`}
                  className="btn-primary px-5 py-2.5 text-[14px]"
                >
                  Call {business.contact.phoneDisplay}
                </a>
                <a
                  href={`mailto:${business.contact.email}?subject=${encodeURIComponent(`Repair appointment request${serviceTitle ? `: ${serviceTitle}` : ""}`)}`}
                  className="btn-secondary px-5 py-2.5 text-[14px]"
                >
                  Email us
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={calendlyHref}
              title="Book an appointment"
              className="h-[640px] w-full rounded-[18px] border border-[var(--hairline)] bg-white"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
