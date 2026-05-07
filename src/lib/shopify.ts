// Shopify storefront — public read-only data + cart-permalink checkout.
//
// SECURITY: This file uses ONLY public Shopify endpoints. No API tokens,
// no secrets. Anyone can hit /products.json on a public storefront —
// it's the same data Shopify already shows on the storefront URL.
// Checkout is constructed via cart permalinks (cart/VARIANT_ID:QTY)
// which redirect to Shopify's secure HTTPS checkout. Payment never
// touches our server.

export const SHOPIFY_DOMAIN = "moving-mobiles-tech.myshopify.com";

const PRODUCTS_URL = `https://${SHOPIFY_DOMAIN}/products.json?limit=250`;

export type ShopifyImage = {
  id?: number;
  src: string;
  alt: string | null;
  width?: number;
  height?: number;
  position?: number;
};

export type ShopifyOption = {
  name: string;
  values: string[];
};

export type ShopifyVariant = {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number;
  available: boolean;
  sku: string;
  options: string[]; // e.g. ["Black", "256GB"]
  imageId?: number | null;
};

export type ShopifyProduct = {
  id: number;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  bodyHtml: string;
  options: ShopifyOption[];
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  /** Single derived price (cheapest available variant). */
  price: number;
  /** Highest variant price for "From X – Y" range UI. */
  priceMax: number;
  /** True if at least one variant is available AND priced > 0. */
  inStock: boolean;
  category: ProductCategory;
};

export type ProductCategory =
  | "iphones"
  | "samsung"
  | "android"
  | "tablets"
  | "watches"
  | "audio"
  | "consoles"
  | "accessories"
  | "services"
  | "other";

export const CATEGORIES: { key: ProductCategory; label: string }[] = [
  { key: "iphones", label: "iPhones" },
  { key: "samsung", label: "Samsung" },
  { key: "tablets", label: "Tablets" },
  { key: "watches", label: "Watches" },
  { key: "audio", label: "Audio" },
  { key: "consoles", label: "Consoles" },
  { key: "accessories", label: "Accessories" },
  { key: "services", label: "Repair Services" },
];

function categorize(p: {
  title: string;
  productType: string;
  tags: string[];
  vendor: string;
}): ProductCategory {
  const t = p.title.toLowerCase();
  const pt = (p.productType || "").toLowerCase();
  const tags = p.tags.map((x) => x.toLowerCase());

  // Tablets first (iPad must beat iPhone match)
  if (/ipad|tablet|surface pro|galaxy tab/.test(t) || pt === "tablet") return "tablets";

  // Watches
  if (/watch|iwatch|smartwatch/.test(t)) return "watches";

  // iPhones
  if (/iphone/.test(t)) return "iphones";

  // Samsung Galaxy phones
  if (/galaxy|samsung/.test(t) && !/watch|tab/.test(t)) return "samsung";

  // Audio
  if (/airpods|earpods|earphone|headphone|beats|jbl|speaker|microphone|lavalier|boombox|radio/.test(t))
    return "audio";

  // Consoles
  if (/playstation|ps5|ps4|xbox|nintendo|switch|joy-con/.test(t)) return "consoles";

  // Repair services (have low prices and "repair"/"replacement"/"service" in title)
  if (
    /repair|replacement|installation|diagnostics|recovery|setup|troubleshooting|firmware|update|virus removal/i.test(
      p.title,
    )
  )
    return "services";

  // Accessories — cases, cables, chargers, mounts, holders, stands, pouches, power banks
  if (
    /case|cover|cable|charger|adopter|adapter|mount|holder|stand|pouch|power bank|sleeve|stylus|pen|tripod|gimbal|stabilizer|backpack|hub|ssd|hdd|keyboard|mouse|dash cam|jump starter|humidifier|fan|lamp/i.test(
      p.title,
    )
  )
    return "accessories";

  if (tags.includes("accessory")) return "accessories";

  return "other";
}

function toShopifyVariant(v: {
  id: number;
  title: string;
  price: string;
  compare_at_price?: string | null;
  available: boolean;
  sku?: string | null;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  image_id?: number | null;
}): ShopifyVariant {
  return {
    id: v.id,
    title: v.title,
    price: Number(v.price) || 0,
    compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
    // Shopify's single-product endpoint returns `available: null`. Treat
    // anything that isn't explicit `false` as available (Shopify still
    // enforces stock at checkout).
    available: v.available !== false,
    sku: v.sku || "",
    options: [v.option1, v.option2, v.option3].filter(
      (o): o is string => Boolean(o) && o !== "Default Title",
    ),
    imageId: v.image_id ?? null,
  };
}

function normalize(raw: any): ShopifyProduct {
  const variants: ShopifyVariant[] = (raw.variants || []).map(toShopifyVariant);
  const prices = variants.map((v) => v.price).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const inStock = variants.some((v) => v.available && v.price > 0);

  const images: ShopifyImage[] = (raw.images || []).map((img: any) => ({
    id: img.id,
    src: img.src,
    alt: img.alt ?? null,
    width: img.width,
    height: img.height,
    position: img.position,
  }));

  const tags: string[] =
    typeof raw.tags === "string"
      ? raw.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(raw.tags)
        ? raw.tags
        : [];

  const productType: string = raw.product_type || "";
  const vendor: string = raw.vendor || "";

  // Shopify's default "Title / Default Title" placeholder for products
  // without real options — treat as having no options at all.
  const rawOptions = (raw.options || []) as { name: string; values: string[] }[];
  const isDefaultOnly =
    rawOptions.length === 1 &&
    rawOptions[0].name === "Title" &&
    rawOptions[0].values.length === 1 &&
    rawOptions[0].values[0] === "Default Title";
  const options = isDefaultOnly
    ? []
    : rawOptions.map((o) => ({ name: o.name, values: o.values }));

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    vendor,
    productType,
    tags,
    bodyHtml: raw.body_html || "",
    options,
    variants,
    images,
    price: minPrice,
    priceMax: maxPrice,
    inStock,
    category: categorize({ title: raw.title, productType, tags, vendor }),
  };
}

/**
 * Fetch ALL products from the public Shopify storefront. Cached for 60s.
 * Auto-paginates if the catalog grows past 250.
 */
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];
  let page = 1;
  while (page < 20) {
    const url = `https://${SHOPIFY_DOMAIN}/products.json?limit=250&page=${page}`;
    const res = await fetch(url, { next: { revalidate: 10, tags: ["shopify"] } });
    if (!res.ok) {
      throw new Error(`Shopify fetch failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const products: any[] = data.products || [];
    if (products.length === 0) break;
    for (const p of products) all.push(normalize(p));
    if (products.length < 250) break;
    page += 1;
  }
  return all;
}

export type ShopifyCollection = {
  id: number;
  handle: string;
  title: string;
  productsCount: number;
};

export type CollectionWithProducts = ShopifyCollection & {
  products: ShopifyProduct[];
};

/**
 * Fetch all collections defined in Shopify Admin.
 * Filters out empty or internal-only collections.
 */
export async function getAllCollections(): Promise<ShopifyCollection[]> {
  const url = `https://${SHOPIFY_DOMAIN}/collections.json?limit=250`;
  const res = await fetch(url, { next: { revalidate: 10, tags: ["shopify"] } });
  if (!res.ok) throw new Error(`Collections fetch failed: ${res.status}`);
  const data = await res.json();
  const cols: ShopifyCollection[] = (data.collections || []).map((c: any) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    productsCount: c.products_count ?? 0,
  }));
  // Filter system-y collections that are typically internal-only or empty
  const HIDDEN_HANDLES = new Set([
    "frontpage",
    "home-page",
    "phone-cases-example-products",
    "screen-protection", // empty
    "bag", // 1-product test collection
  ]);
  return cols.filter(
    (c) => c.productsCount > 0 && !HIDDEN_HANDLES.has(c.handle),
  );
}

/** Fetch the products inside a single Shopify collection. */
export async function getCollectionProducts(
  handle: string,
): Promise<ShopifyProduct[]> {
  const url = `https://${SHOPIFY_DOMAIN}/collections/${encodeURIComponent(handle)}/products.json?limit=250`;
  const res = await fetch(url, { next: { revalidate: 10, tags: ["shopify"] } });
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Collection products fetch failed: ${res.status}`);
  }
  const data = await res.json();
  return (data.products || []).map(normalize);
}

/**
 * Fetch every collection together with its products. Runs in parallel.
 * Used by /shop to render Shopify-defined sections.
 */
export async function getCollectionsWithProducts(): Promise<
  CollectionWithProducts[]
> {
  const cols = await getAllCollections();
  const withProducts = await Promise.all(
    cols.map(async (c) => ({
      ...c,
      products: await getCollectionProducts(c.handle),
    })),
  );
  return withProducts.filter((c) => c.products.length > 0);
}

export async function getProductByHandle(
  handle: string,
): Promise<ShopifyProduct | null> {
  // Shopify provides a per-product JSON: /products/HANDLE.json
  const url = `https://${SHOPIFY_DOMAIN}/products/${encodeURIComponent(handle)}.json`;
  const res = await fetch(url, { next: { revalidate: 10, tags: ["shopify"] } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Shopify product fetch failed: ${res.status}`);
  }
  const data = await res.json();
  if (!data.product) return null;
  return normalize(data.product);
}

/**
 * Build a Shopify cart permalink. Example:
 *   https://store.myshopify.com/cart/12345:1,67890:2
 * The redirect lands on Shopify's secure checkout page with the items
 * already added — payment, shipping, taxes all handled by Shopify.
 */
export function buildCheckoutUrl(
  items: { variantId: number; quantity: number }[],
): string {
  if (items.length === 0) return `https://${SHOPIFY_DOMAIN}/cart`;
  const segments = items
    .filter((i) => i.quantity > 0)
    .map((i) => `${i.variantId}:${i.quantity}`)
    .join(",");
  return `https://${SHOPIFY_DOMAIN}/cart/${segments}`;
}

export function formatPrice(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function imageForVariant(
  product: ShopifyProduct,
  variant: ShopifyVariant,
): ShopifyImage | null {
  if (variant.imageId) {
    const img = product.images.find((i) => i.id === variant.imageId);
    if (img) return img;
  }
  return product.images[0] ?? null;
}
