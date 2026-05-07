/**
 * Display order of collections on /shop.
 *
 * Collections listed here render in this exact order, top-to-bottom.
 * Any collection NOT listed below appears at the END of the list,
 * in the order Shopify returns it.
 *
 * To reorder: just rearrange the entries below. To pin something to
 * the top, put it first. To remove a section from /shop entirely,
 * add its handle to HIDDEN_HANDLES in src/lib/shopify.ts instead.
 */
export const COLLECTION_DISPLAY_ORDER: string[] = [
  // Featured / top-of-page
  "home-page-cases", // Star Products
  "top-picks",
  // Phones
  "samsung",
  "iphone-cases",
  "phone-cases",
  "samsung-case",
  // Watches
  "apple-watch",
  "apple-watches",
  "apple-watch-straps",
  "samsung-watches",
  // Audio
  "apple-airpods",
  "ear-phones-headphones-1",
  "ear-phones-headphones",
  // Gaming
  "gaming-console",
  "playstation",
  "xbox",
  // Charging & power
  "cables-adapters",
  "wall-laptop-charger",
  "wireless-charging",
  "power-bank",
  // Accessories
  "kayboard-mouse",
  "stands-gimbals",
  "storage-devices-hubs",
  // Master collections
  "apple-products-1",
  // Repair (last — services rather than products)
  "repair-services",
  "in-store-repairs",
];

/**
 * Sort a list of collections according to COLLECTION_DISPLAY_ORDER.
 * Anything not in the order array goes to the bottom in original order.
 */
export function sortByDisplayOrder<T extends { handle: string }>(
  collections: T[],
): T[] {
  const order = new Map(
    COLLECTION_DISPLAY_ORDER.map((h, i) => [h, i] as const),
  );
  return [...collections].sort((a, b) => {
    const ai = order.get(a.handle) ?? Number.POSITIVE_INFINITY;
    const bi = order.get(b.handle) ?? Number.POSITIVE_INFINITY;
    return ai - bi;
  });
}

// Display-name overrides for Shopify collections whose titles have
// typos or read better with cleaner naming. Single source of truth —
// imported by ShopBrowser, CollectionCarousel, and the dedicated
// /shop/c/[handle] page.
export const COLLECTION_LABEL_OVERRIDES: Record<string, string> = {
  "kayboard-mouse": "Keyboard & Mouse",
  "samsung-watches": "Samsung Watches",
  "samsung-case": "Samsung Cases",
  "ear-phones-headphones-1": "Earphones & Headphones",
  "ear-phones-headphones": "Mics",
  "apple-products-1": "Apple Products",
  "apple-watch-straps": "Apple Watch Straps",
  "apple-watches": "Apple Watches",
  "apple-watch": "Apple Watch",
  "apple-airpods": "Apple AirPods",
  "phone-cases": "Phone Cases",
  "iphone-cases": "iPhone Cases",
  "wall-laptop-charger": "Wall & Laptop Chargers",
  "power-bank": "Power Banks",
  "cables-adapters": "Cables & Adapters",
  "wireless-charging": "Wireless Charging",
  "stands-gimbals": "Stands & Gimbals",
  "storage-devices-hubs": "Storage Devices & Hubs",
  "in-store-repairs": "Electronics Repairs",
  "repair-services": "Repair Services",
  "gaming-console": "Gaming Consoles",
  playstation: "PlayStation",
  xbox: "Xbox",
  samsung: "Samsung Phones",
  "home-page-cases": "Star Products",
  "top-picks": "Top Picks",
};

export function labelFor(handle: string, fallback: string): string {
  return COLLECTION_LABEL_OVERRIDES[handle] ?? fallback;
}
