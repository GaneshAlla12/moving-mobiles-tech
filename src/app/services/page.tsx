import type { Metadata } from "next";
import ServiceCard from "@/components/ServiceCard";
import BookButton from "@/components/BookButton";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "All Repair Services",
  description:
    "Phone, tablet, laptop, and audio repair services in Wilton, Connecticut. Same-day fixes for screens, batteries, charging ports, motherboards, water damage, and more.",
};

export default function ServicesIndex() {
  return (
    <>
      <section className="tile-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-10 text-center">
          <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
            Repair services
          </div>
          <h1
            className="mx-auto mt-3 max-w-3xl font-semibold leading-[1.07] tracking-[-0.005em]"
            style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            Every repair we offer, from screens to motherboards.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
            Pick the service that matches your problem and book a time. Not
            sure what&apos;s wrong? Our Quick Diagnostics service is free.
          </p>
          <div className="mt-8 flex justify-center">
            <BookButton size="lg" />
          </div>
        </div>
      </section>

      <section className="tile-parchment">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
