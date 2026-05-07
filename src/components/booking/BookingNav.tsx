"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  backHref?: string | null;
  nextHref?: string | null;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext?: () => void; // optional pre-navigation hook
};

export default function BookingNav({
  backHref,
  nextHref,
  nextLabel = "Continue",
  nextDisabled = false,
  onNext,
}: Props) {
  const router = useRouter();

  const handleNext = () => {
    if (nextDisabled) return;
    onNext?.();
    if (nextHref) router.push(nextHref);
  };

  return (
    <div className="border-t border-[var(--hairline)] bg-[var(--canvas)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[15px] text-[var(--ink)] hover:text-[var(--primary)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </Link>
        ) : (
          <span />
        )}

        {nextHref || onNext ? (
          <button
            onClick={handleNext}
            disabled={nextDisabled}
            className={`btn-primary px-7 py-2.5 text-[15px] ${nextDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {nextLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
