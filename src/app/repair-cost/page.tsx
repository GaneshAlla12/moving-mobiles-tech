import type { Metadata } from "next";
import RepairEstimator from "@/components/RepairEstimator";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "Repair Cost Estimate",
  description:
    "Estimate the cost to repair your iPhone (14, 15, 16, Air, 17 series) or Samsung Galaxy (S21–S25, Z Fold, Z Flip, Note 20) — battery, screen, back glass, camera, and more.",
};

export default function RepairCost() {
  return (
    <>
      <section className="tile-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-10 text-center">
          <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
            Repair pricing
          </div>
          <h1
            className="mx-auto mt-3 max-w-3xl font-semibold leading-[1.07] tracking-[-0.005em]"
            style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            How much will my repair cost?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
            Pick your device below to see an estimate for the most common
            repairs. We&apos;ll confirm the final price in person with a free
            diagnostic.
          </p>
        </div>
      </section>

      <section className="tile-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
          <RepairEstimator />
        </div>
      </section>

      <section className="tile-parchment">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 section-pad">
          <h2
            className="text-center font-semibold leading-[1.1] tracking-[-0.005em]"
            style={{ fontSize: "clamp(24px, 3vw, 34px)" }}
          >
            Why customers choose us
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              {
                t: "It's easy.",
                d: "A seamless experience from start to finish. We help you find the right option, give you an upfront estimate, and keep you informed.",
              },
              {
                t: "It's private.",
                d: "Your data stays your data. Technicians only access what's needed to repair the device — nothing more.",
              },
              {
                t: "It's guaranteed.",
                d: "Service and replacement parts are covered for 90 days. Quality-tested parts that meet our performance standards.",
              },
            ].map((c) => (
              <div key={c.t} className="card">
                <div className="text-[17px] font-semibold tracking-[-0.011em] text-[var(--ink)]">
                  {c.t}
                </div>
                <p className="mt-2 text-[15px] text-[var(--ink-muted-80)] leading-[1.5]">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tile-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 section-pad">
          <h2
            className="text-center font-semibold leading-[1.1] tracking-[-0.005em]"
            style={{ fontSize: "clamp(24px, 3vw, 34px)" }}
          >
            Questions? Answers.
          </h2>
          <div className="mt-10 space-y-3">
            {[
              {
                q: "Where can I find information about my repair?",
                a:
                  "Once a repair is booked, you'll get a confirmation by email with a tracking link. You can also call our shop at " +
                  business.contact.phoneDisplay +
                  " with the repair ID for a status update.",
              },
              {
                q: "What's covered under warranty?",
                a: "Our service warranty covers replaced parts and workmanship for 90 days. Accidental damage and normal battery wear are not covered.",
              },
              {
                q: "Is there a service guarantee?",
                a: "Yes. If a repair fails within the warranty period due to our workmanship or a faulty replacement part, we'll redo the repair at no extra cost.",
              },
              {
                q: "My device isn't in the list. Can you still fix it?",
                a: "Probably! These are estimates for the most common models. Bring it in or call us — we repair most phones, tablets, and laptops on the market.",
              },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)] p-5"
              >
                <summary className="cursor-pointer list-none text-[17px] font-semibold tracking-[-0.011em] flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-[var(--primary)] text-2xl leading-none transition-transform group-open:rotate-45 select-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] text-[var(--ink-muted-80)] leading-[1.5]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
