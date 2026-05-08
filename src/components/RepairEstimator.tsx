"use client";

import { useMemo, useState } from "react";
import { brands, findModel } from "@/lib/repair-pricing";
import BookButton from "./BookButton";

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

export default function RepairEstimator() {
  const [brandKey, setBrandKey] = useState<string>(brands[0].key);
  const [modelKey, setModelKey] = useState<string>(brands[0].models[0].key);

  const brand = useMemo(
    () => brands.find((b) => b.key === brandKey) ?? brands[0],
    [brandKey],
  );
  const model = useMemo(
    () => findModel(brandKey, modelKey) ?? brand.models[0],
    [brandKey, modelKey, brand],
  );

  const onBrandChange = (key: string) => {
    setBrandKey(key);
    const b = brands.find((br) => br.key === key);
    if (b) setModelKey(b.models[0].key);
  };

  return (
    <div className="rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)] p-8 sm:p-12">
      <div className="text-center">
        <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.011em]">
          Choose your device
        </h2>
        <p className="mt-2 text-[15px] text-[var(--ink-muted-48)]">
          See an estimated repair cost in seconds.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
        <Field label="Device type">
          <select
            aria-label="Select device brand"
            value={brandKey}
            onChange={(e) => onBrandChange(e.target.value)}
            className="mm-select"
          >
            {brands.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Model">
          <select
            aria-label="Select model"
            value={modelKey}
            onChange={(e) => setModelKey(e.target.value)}
            className="mm-select"
          >
            {brand.models.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-10 mx-auto max-w-2xl rounded-[18px] border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--hairline)] flex items-center justify-between">
          <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
            Estimated service cost
          </span>
          <span className="text-[14px] text-[var(--primary)] font-semibold tracking-[-0.011em]">
            {model.label}
          </span>
        </div>
        <ul>
          {brand.serviceLines.map((line, i) => {
            const p = model.prices[line] ?? 0;
            return (
              <li
                key={line}
                className={`flex items-center justify-between px-6 py-3.5 text-[15px] ${i === 0 ? "" : "border-t border-[var(--hairline)]"}`}
              >
                <span className="text-[var(--ink-muted-80)]">{line}</span>
                <span
                  className={`font-medium ${p === 0 ? "text-[var(--ink-muted-48)]" : "text-[var(--ink)]"}`}
                >
                  {p === 0 ? "Varies — bring it in" : fmt(p)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        <BookButton size="lg" serviceTitle={`${model.label} repair`} />
        <p className="text-[12px] text-[var(--ink-muted-48)] max-w-md text-center leading-[1.5]">
          Estimates only. Final price confirmed at in-shop inspection. No fix,
          no fee — diagnostics are always free.
        </p>
      </div>

      <style>{`
        .mm-select {
          width: 100%;
          appearance: none;
          background: var(--canvas);
          color: var(--ink);
          border: 1px solid var(--hairline);
          border-radius: 11px;
          padding: 12px 40px 12px 16px;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: -0.022em;
          background-image: linear-gradient(45deg, transparent 50%, var(--ink-muted-48) 50%), linear-gradient(135deg, var(--ink-muted-48) 50%, transparent 50%);
          background-position: right 18px center, right 13px center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          transition: border-color 150ms ease, box-shadow 150ms ease;
          cursor: pointer;
        }
        .mm-select:hover { border-color: var(--ink-muted-48); }
        .mm-select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
      `}</style>
    </div>
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
