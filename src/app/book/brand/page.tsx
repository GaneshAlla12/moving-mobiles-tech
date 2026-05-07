"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/components/booking/BookingProvider";
import BookingNav from "@/components/booking/BookingNav";
import { brandsFor, deviceTypes } from "@/lib/booking";

export default function StepBrand() {
  const router = useRouter();
  const { state, hydrated, setField } = useBooking();

  const brands = useMemo(() => brandsFor(state.deviceType), [state.deviceType]);
  const deviceLabel = state.deviceType
    ? deviceTypes.find((d) => d.key === state.deviceType)?.label?.toLowerCase()
    : "device";

  useEffect(() => {
    if (!hydrated) return;
    if (!state.deviceType) router.replace("/book");
  }, [hydrated, state.deviceType, router]);

  if (!hydrated || !state.deviceType) return null;

  const onBrandChange = (brand: string) => {
    setField("brand", brand);
    setField("model", undefined);
  };

  return (
    <>
      <h1
        className="font-semibold leading-[1.07] tracking-[-0.005em]"
        style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
      >
        What kind of {deviceLabel} is it?
      </h1>
      <p className="mt-3 text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
        You&apos;re in good hands — we repair thousands of devices every year.
      </p>

      <div className="mt-8 max-w-md space-y-4">
        <Field label="Brand">
          <select
            aria-label="Select brand"
            value={state.brand ?? ""}
            onChange={(e) => onBrandChange(e.target.value)}
            className="mm-select"
          >
            <option value="" disabled>
              Choose a brand
            </option>
            {brands.map((b) => (
              <option key={b.brand} value={b.brand}>
                {b.brand}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="mt-6 text-[14px] text-[var(--ink-muted-48)]">
        Have questions?{" "}
        <a href="tel:+12035155987" className="text-[var(--primary)] hover:underline">
          Call us at (203) 515-5987
        </a>
        .
      </p>

      <div className="mt-12">
        <BookingNav
          backHref="/book"
          nextHref="/book/model"
          nextDisabled={!state.brand}
        />
      </div>

      <SelectStyles />
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

function SelectStyles() {
  return (
    <style>{`
      .mm-select {
        width: 100%;
        appearance: none;
        background: var(--canvas);
        color: var(--ink);
        border: 1px solid var(--hairline);
        border-radius: 11px;
        padding: 14px 44px 14px 16px;
        font-size: 15px;
        font-weight: 400;
        letter-spacing: -0.022em;
        background-image: linear-gradient(45deg, transparent 50%, var(--ink-muted-48) 50%), linear-gradient(135deg, var(--ink-muted-48) 50%, transparent 50%);
        background-position: right 18px center, right 13px center;
        background-size: 5px 5px, 5px 5px;
        background-repeat: no-repeat;
        cursor: pointer;
      }
      .mm-select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
    `}</style>
  );
}
