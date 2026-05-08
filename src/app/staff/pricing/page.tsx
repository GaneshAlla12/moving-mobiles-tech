import type { Metadata } from "next";
import { brands as defaultBrands } from "@/lib/repair-pricing";
import {
  getPricingOverrides,
  isPricingConfigured,
} from "@/lib/pricing-config";
import PricingEditor from "@/components/staff/PricingEditor";

export const metadata: Metadata = {
  title: "Repair pricing CMS",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function StaffPricingPage() {
  const [overrides] = await Promise.all([getPricingOverrides()]);
  const storageOk = isPricingConfigured();

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--canvas-sunken)]">
      <header className="border-b border-[var(--hairline)] bg-[var(--canvas)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
          <div className="eyebrow flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            Staff · Repair pricing
          </div>
          <h1 className="mt-3 h-display-md">Edit repair prices</h1>
          <p className="mt-3 text-[15px] text-[var(--ink-muted-60)] leading-[1.55] max-w-2xl">
            Pick a brand and model to edit its repair prices. Changes
            instantly reflect on the public{" "}
            <code className="text-[13px] rounded bg-[var(--canvas-sunken)] px-1.5 py-0.5 border border-[var(--hairline)]">
              /repair-cost
            </code>{" "}
            page after saving.
          </p>
          {!storageOk && (
            <div
              className="mt-6 rounded-[14px] p-4 text-[14px] text-[var(--ink-muted-80)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,193,7,0.08), rgba(255,193,7,0.04))",
                border: "1px solid rgba(255, 193, 7, 0.25)",
              }}
            >
              Storage not configured — changes will preview only.
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <PricingEditor
          brands={defaultBrands}
          initialOverrides={overrides?.prices ?? {}}
        />
      </div>
    </div>
  );
}
