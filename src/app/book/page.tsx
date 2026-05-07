"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBooking } from "@/components/booking/BookingProvider";
import { deviceTypes, type DeviceTypeKey } from "@/lib/booking";
import BookingNav from "@/components/booking/BookingNav";
import DeviceIcon from "@/components/booking/DeviceIcon";
import Reveal from "@/components/Reveal";

// Reads ?service=… and seeds the description so the tech sees it later.
function ServicePrefill() {
  const searchParams = useSearchParams();
  const { state, setField } = useBooking();
  useEffect(() => {
    const service = searchParams.get("service");
    if (service && !state.description) {
      setField("description", `Interested in: ${service}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function StepDeviceType() {
  const router = useRouter();
  const { state, setField } = useBooking();

  const choose = (key: DeviceTypeKey) => {
    setField("deviceType", key);
    setField("brand", undefined);
    setField("model", undefined);
    setField("customDevice", undefined);
    setField("issues", []);
    if (key === "other") router.push("/book/issue");
    else router.push("/book/brand");
  };

  return (
    <>
      <Suspense fallback={null}>
        <ServicePrefill />
      </Suspense>

      <h1
        className="font-semibold leading-[1.07] tracking-[-0.005em]"
        style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
      >
        What can we help you with today?
      </h1>
      <p className="mt-3 text-[17px] text-[var(--ink-muted-80)] leading-[1.5]">
        Get a free consultation and a fast repair.
      </p>

      <Reveal stagger className="mt-8 grid grid-cols-2 gap-4 max-w-xl">
        {deviceTypes.map((d) => (
          <button
            key={d.key}
            onClick={() => choose(d.key)}
            className={`group rounded-[18px] border-2 ${state.deviceType === d.key ? "border-[var(--ink)]" : "border-[var(--hairline)]"} bg-[var(--canvas)] p-6 text-left transition-all hover:border-[var(--ink)] hover:-translate-y-0.5`}
          >
            <div className="aspect-square mx-auto w-20 grid place-items-center rounded-[14px] bg-[var(--surface)] text-[var(--ink)] transition-colors group-hover:bg-[var(--primary-soft)] group-hover:text-[var(--primary)]">
              <DeviceIcon type={d.key} className="h-10 w-10" />
            </div>
            <div className="mt-5 text-[17px] font-semibold tracking-[-0.011em]">
              {d.label}
            </div>
            <div className="mt-1 text-[13px] text-[var(--ink-muted-48)]">
              {d.description}
            </div>
          </button>
        ))}
      </Reveal>

      <div className="mt-12">
        <BookingNav backHref="/" nextHref={null} />
      </div>
    </>
  );
}
