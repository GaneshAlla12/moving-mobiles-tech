import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/lib/services";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block overflow-hidden rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)] transition-colors hover:border-[var(--primary)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)]">
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
        <h3 className="text-[17px] font-semibold tracking-[-0.022em] text-[var(--ink)]">
          {service.title}
        </h3>
        <p className="mt-2 text-[14px] leading-[1.43] text-[var(--ink-muted-48)] line-clamp-2">
          {service.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-[14px] text-[var(--primary)]">
          Learn more
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
