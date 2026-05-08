"use client";

import { useMemo, useState } from "react";
import type { Brand } from "@/lib/repair-pricing";

type Props = {
  /** All brands with their default model prices. */
  brands: Brand[];
  /** Saved overrides — sparse map of "brand|model|line" → price. */
  initialOverrides: Record<string, number>;
};

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

export default function PricingEditor({ brands, initialOverrides }: Props) {
  const [overrides, setOverrides] =
    useState<Record<string, number>>(initialOverrides);
  const [brandKey, setBrandKey] = useState(brands[0].key);
  const [modelKey, setModelKey] = useState(brands[0].models[0].key);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dirty, setDirty] = useState(false);

  const brand = useMemo(
    () => brands.find((b) => b.key === brandKey) ?? brands[0],
    [brands, brandKey],
  );
  const model = useMemo(
    () => brand.models.find((m) => m.key === modelKey) ?? brand.models[0],
    [brand, modelKey],
  );

  const onBrandChange = (key: string) => {
    setBrandKey(key);
    const b = brands.find((br) => br.key === key);
    if (b) setModelKey(b.models[0].key);
  };

  const keyFor = (line: string) => `${brand.key}|${model.key}|${line}`;

  /** Effective price = override if present, otherwise default. */
  const effective = (line: string): number => {
    const k = keyFor(line);
    if (k in overrides) return overrides[k];
    return model.prices[line] ?? 0;
  };

  const isOverridden = (line: string) => keyFor(line) in overrides;

  const setPrice = (line: string, value: number) => {
    const k = keyFor(line);
    setOverrides((prev) => {
      const next = { ...prev };
      // If new value matches default, drop the override (keeps map sparse).
      if (value === (model.prices[line] ?? 0)) {
        delete next[k];
      } else {
        next[k] = value;
      }
      return next;
    });
    setDirty(true);
  };

  const resetLine = (line: string) => {
    const k = keyFor(line);
    setOverrides((prev) => {
      if (!(k in prev)) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
    setDirty(true);
  };

  const resetAll = () => {
    if (!confirm("Reset all overrides for this model back to defaults?"))
      return;
    setOverrides((prev) => {
      const next = { ...prev };
      for (const line of brand.serviceLines) {
        delete next[keyFor(line)];
      }
      return next;
    });
    setDirty(true);
  };

  const onSave = async () => {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/staff/pricing", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prices: overrides }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      setStatus({ kind: "saved" });
      setDirty(false);
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Save failed",
      });
    }
  };

  // Count overrides for the current model
  const modelOverrideCount = brand.serviceLines.filter((line) =>
    isOverridden(line),
  ).length;
  const totalOverrides = Object.keys(overrides).length;

  return (
    <div className="space-y-5">
      {/* Sticky toolbar */}
      <div
        className="sticky top-[72px] z-20 flex items-center justify-between gap-4 rounded-[14px] px-5 py-3"
        style={{
          background: "var(--glass-bg-strong)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-muted-60)] flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: "var(--canvas-elevated)",
              border: "1px solid var(--hairline)",
            }}
          >
            <span
              className="inline-block w-1 h-1 rounded-full"
              style={{
                background:
                  totalOverrides > 0 ? "var(--primary)" : "var(--ink-muted-48)",
              }}
            />
            {totalOverrides} {totalOverrides === 1 ? "override" : "overrides"}{" "}
            saved
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} dirty={dirty} />
          <button
            onClick={onSave}
            disabled={status.kind === "saving" || !dirty}
            className={`btn-primary px-5 py-2 text-[13px] ${status.kind === "saving" || !dirty ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {status.kind === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Pickers */}
      <div
        className="rounded-[16px] p-5 grid gap-4 sm:grid-cols-2 max-w-2xl"
        style={{
          background: "var(--canvas)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <Field label="Brand">
          <select
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

      {/* Editable price list */}
      <div
        className="rounded-[16px] overflow-hidden"
        style={{
          background: "var(--canvas)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--hairline)]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium">
              Editing prices for
            </div>
            <div className="mt-0.5 text-[16px] font-semibold tracking-[-0.012em]">
              {model.label}
            </div>
          </div>
          {modelOverrideCount > 0 && (
            <button
              onClick={resetAll}
              className="text-[12px] text-[var(--ink-muted-60)] hover:text-[var(--ink)] transition-colors"
            >
              Reset all
            </button>
          )}
        </div>

        <ul>
          {brand.serviceLines.map((line, i) => {
            const v = effective(line);
            const overridden = isOverridden(line);
            const defaultVal = model.prices[line] ?? 0;
            return (
              <li
                key={line}
                className={`flex items-center gap-4 px-5 py-3.5 ${i === 0 ? "" : "border-t border-[var(--hairline)]"}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-[var(--ink)]">{line}</div>
                  {overridden && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--ink-muted-48)]">
                      <span
                        className="inline-block w-1 h-1 rounded-full"
                        style={{ background: "var(--primary)" }}
                      />
                      Overridden · default {fmt(defaultVal)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[14px] text-[var(--ink-muted-48)]">
                    $
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={9999}
                    step={1}
                    value={v}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n)) setPrice(line, n);
                    }}
                    className="w-24 rounded-[10px] px-3 py-2 text-[15px] text-right tabular-nums font-medium transition-colors"
                    style={{
                      background: "var(--canvas-elevated)",
                      border: `1px solid ${overridden ? "var(--primary)" : "var(--hairline)"}`,
                      color: "var(--ink)",
                      boxShadow: overridden
                        ? "0 0 0 3px var(--primary-soft)"
                        : "none",
                    }}
                    aria-label={`${line} price`}
                  />
                  <button
                    onClick={() => resetLine(line)}
                    disabled={!overridden}
                    aria-label="Reset to default"
                    title="Reset to default"
                    className="grid w-7 h-7 place-items-center rounded-md transition-colors"
                    style={{
                      background: "var(--canvas-elevated)",
                      border: "1px solid var(--hairline)",
                      color: overridden
                        ? "var(--ink-muted-60)"
                        : "var(--ink-muted-32)",
                      opacity: overridden ? 1 : 0.4,
                      cursor: overridden ? "pointer" : "not-allowed",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-[12px] text-[var(--ink-muted-48)] leading-[1.5]">
        Tip: change a value to override it (input glows blue). Click the reset
        arrow to revert that line. A price of <strong>0</strong> shows as
        &ldquo;Varies — bring it in&rdquo; on the public page.
      </p>

      <style>{`
        .mm-select {
          width: 100%;
          appearance: none;
          background: var(--canvas);
          color: var(--ink);
          border: 1px solid var(--hairline-strong);
          border-radius: 12px;
          padding: 12px 40px 12px 14px;
          font-size: 14px;
          font-weight: 500;
          background-image:
            linear-gradient(45deg, transparent 50%, var(--ink-muted-48) 50%),
            linear-gradient(135deg, var(--ink-muted-48) 50%, transparent 50%);
          background-position: right 18px center, right 13px center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          transition: border-color 150ms var(--ease-out-expo),
                      box-shadow 150ms var(--ease-out-expo);
          cursor: pointer;
        }
        .mm-select:hover { border-color: var(--ink-muted-32); }
        .mm-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-soft);
        }
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
      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function StatusBadge({ status, dirty }: { status: Status; dirty: boolean }) {
  if (status.kind === "saved" && !dirty)
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full"
        style={{ background: "rgba(34, 197, 94, 0.10)", color: "#15803d" }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#22c55e" }}
        />
        Saved
      </span>
    );
  if (status.kind === "error")
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full"
        style={{ background: "rgba(239, 68, 68, 0.10)", color: "#b91c1c" }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#ef4444" }}
        />
        {status.message}
      </span>
    );
  if (dirty)
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full"
        style={{
          background: "var(--canvas-elevated)",
          color: "var(--ink-muted-60)",
          border: "1px solid var(--hairline)",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#f59e0b" }}
        />
        Unsaved changes
      </span>
    );
  return null;
}
