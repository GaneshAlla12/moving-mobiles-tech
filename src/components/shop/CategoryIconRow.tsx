"use client";

import type { CollectionWithProducts } from "@/lib/shopify";
import { CategoryIcon, iconForCollection } from "./CategoryIcon";

const FEATURED_HANDLES = new Set(["home-page-cases", "top-picks"]);

export default function CategoryIconRow({
  collections,
}: {
  collections: CollectionWithProducts[];
}) {
  const visible = collections.filter((c) => !FEATURED_HANDLES.has(c.handle));

  const onClick = (handle: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(handle);
    if (!el) return;
    const headerOffset = 80;
    const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Shop categories"
      className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto"
    >
      <ul className="flex gap-3 sm:flex-wrap sm:justify-center min-w-max sm:min-w-0">
        {visible.map((c) => (
          <li key={c.id} className="shrink-0">
            <a
              href={`#${c.handle}`}
              onClick={onClick(c.handle)}
              className="flex flex-col items-center gap-2 w-[88px] sm:w-[96px] rounded-[14px] border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-4 text-center transition-colors hover:border-[var(--ink)] hover:bg-[var(--surface-2)]"
            >
              <span className="grid h-9 w-9 place-items-center text-[var(--ink)]">
                <CategoryIcon
                  kind={iconForCollection(c.handle, c.title)}
                  className="h-7 w-7"
                />
              </span>
              <span className="text-[12px] font-medium tracking-[-0.011em] text-[var(--ink)] line-clamp-2 leading-[1.2]">
                {c.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
