import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services, getService } from "@/lib/services";
import BookButton from "@/components/BookButton";
import ServiceCard from "@/components/ServiceCard";
import { business } from "@/lib/business";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  props: PageProps<"/services/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.description,
  };
}

export default async function ServicePage(
  props: PageProps<"/services/[slug]">
) {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <section className="tile-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-4">
          <Link
            href="/services"
            className="text-[13px] text-[var(--ink-muted-48)] hover:text-[var(--primary)]"
          >
            ← All services
          </Link>
        </div>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 pb-20 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col justify-center">
            <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
              Repair service
            </div>
            <h1
              className="mt-3 font-semibold leading-[1.07] tracking-[-0.005em]"
              style={{ fontSize: "clamp(32px, 4.5vw, 48px)" }}
            >
              {service.title}
            </h1>
            <p className="mt-5 text-[19px] text-[var(--ink-muted-80)] leading-[1.5]">
              {service.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton size="lg" serviceTitle={service.title} />
              <a
                href={`tel:${business.contact.phone}`}
                className="btn-secondary px-7 py-3 text-[17px]"
              >
                Call us
              </a>
            </div>
            <ul className="mt-10 space-y-3 text-[15px]">
              {[
                "Free diagnostics, transparent quote",
                "OEM-grade parts when possible",
                "90-day warranty on all repairs",
                "Most repairs completed same day",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  <span className="text-[var(--ink-muted-80)]">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[var(--surface)] product-shadow">
            <Image
              src={service.image}
              alt={service.title}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="tile-parchment">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 section-pad">
          <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
            Other services
          </div>
          <h2
            className="mt-2 font-semibold leading-[1.1] tracking-[-0.005em]"
            style={{ fontSize: "clamp(24px, 3vw, 34px)" }}
          >
            You might also need
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
