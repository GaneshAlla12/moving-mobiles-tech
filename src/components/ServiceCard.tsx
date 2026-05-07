import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/lib/services";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block overflow-hidden rounded-[20px] transition-all duration-500"
      style={{
        background: "var(--canvas-elevated)",
        border: "1px solid var(--hairline)",
      }}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: "var(--canvas-sunken)" }}
      >
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {/* subtle overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.30), rgba(0,0,0,0))",
          }}
        />
      </div>
      <div className="p-7">
        <h3
          className="text-[18px] font-semibold tracking-[-0.018em]"
          style={{ color: "var(--ink)" }}
        >
          {service.title}
        </h3>
        <p
          className="mt-2 text-[14px] leading-[1.5] line-clamp-2"
          style={{ color: "var(--ink-muted-60)" }}
        >
          {service.description}
        </p>
        <span
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium transition-transform duration-300 group-hover:translate-x-1"
          style={{ color: "var(--ink)" }}
        >
          Learn more
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
