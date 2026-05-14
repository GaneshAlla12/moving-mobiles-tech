import { Redis } from "@upstash/redis";

/**
 * Shopify Storefront API client — direct, cached, fast.
 *
 * Used by /api/vapi/lookup-products to give Maria (the voice assistant)
 * near-instant product information without going through the n8n middleware.
 *
 * Caching strategy: per-search-term key in Upstash Redis, TTL 5 minutes.
 * Most customer questions about a model repeat within minutes, so cache
 * hits are common. A 5-minute TTL keeps inventory data fresh enough.
 *
 * Required env vars:
 *   - SHOPIFY_STORE_DOMAIN          (default: moving-mobiles-tech.myshopify.com)
 *   - SHOPIFY_STOREFRONT_TOKEN      Storefront API public access token
 *   - UPSTASH_REDIS_REST_URL        already configured
 *   - UPSTASH_REDIS_REST_TOKEN      already configured
 */

const DEFAULT_STORE = "moving-mobiles-tech.myshopify.com";
const API_VERSION = "2026-04";
const CACHE_TTL_SECONDS = 5 * 60;

export type StorefrontProduct = {
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  priceMin: number;
  priceMax: number;
  currencyCode: string;
  variants: Array<{
    title: string;
    price: number;
    availableForSale: boolean;
  }>;
  /** Derived: at least one variant is available. */
  anyAvailable: boolean;
};

export type LookupResult = {
  searchTerm: string;
  cached: boolean;
  cacheKey: string;
  fetchedAt: string;
  products: StorefrontProduct[];
  /** Plain-language summary Maria can speak directly. */
  summary: string;
};

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getStorefrontConfig() {
  const domain =
    process.env.SHOPIFY_STORE_DOMAIN?.trim() || DEFAULT_STORE;
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "SHOPIFY_STOREFRONT_TOKEN env var is not set — get it from Headless app → Storefront API → Public access token",
    );
  }
  return {
    url: `https://${domain}/api/${API_VERSION}/graphql.json`,
    token,
  };
}

const SEARCH_QUERY = /* GraphQL */ `
  query SearchProducts($q: String!) {
    products(first: 50, query: $q) {
      edges {
        node {
          title
          vendor
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 8) {
            edges {
              node {
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

type GraphQLResponse = {
  data?: {
    products?: {
      edges?: Array<{
        node?: {
          title?: string;
          vendor?: string;
          productType?: string;
          tags?: string[];
          priceRange?: {
            minVariantPrice?: { amount?: string; currencyCode?: string };
            maxVariantPrice?: { amount?: string; currencyCode?: string };
          };
          variants?: {
            edges?: Array<{
              node?: {
                title?: string;
                price?: { amount?: string; currencyCode?: string };
                availableForSale?: boolean;
              };
            }>;
          };
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
};

/**
 * Search Shopify products. Cached for 5 minutes per search term.
 */
export async function lookupProducts(rawSearchTerm: string): Promise<LookupResult> {
  const searchTerm = rawSearchTerm.trim();
  const cacheKey = `vapi:products:${searchTerm.toLowerCase()}`;
  const redis = getRedis();

  // Try cache first.
  if (redis) {
    try {
      const cached = (await redis.get(cacheKey)) as LookupResult | null;
      if (cached) {
        return { ...cached, cached: true };
      }
    } catch (e) {
      // Cache miss is fine; we'll fall through to live fetch.
      console.warn("[lookupProducts] redis read failed:", e);
    }
  }

  const { url, token } = getStorefrontConfig();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({
      query: SEARCH_QUERY,
      variables: { q: searchTerm },
    }),
    // Important: avoid Next's data cache; we use our own Redis cache.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify request failed: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as GraphQLResponse;
  if (body.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${body.errors.map((e) => e.message).join("; ")}`,
    );
  }

  const products: StorefrontProduct[] = (body.data?.products?.edges ?? [])
    .map((edge) => edge.node)
    .filter((n): n is NonNullable<typeof n> => Boolean(n))
    .map((n) => {
      const minAmount = Number(n.priceRange?.minVariantPrice?.amount ?? 0);
      const maxAmount = Number(n.priceRange?.maxVariantPrice?.amount ?? 0);
      const currencyCode =
        n.priceRange?.minVariantPrice?.currencyCode ?? "USD";

      const variants = (n.variants?.edges ?? [])
        .map((e) => e.node)
        .filter((v): v is NonNullable<typeof v> => Boolean(v))
        .map((v) => ({
          title: v.title ?? "",
          price: Number(v.price?.amount ?? 0),
          availableForSale: Boolean(v.availableForSale),
        }));

      return {
        title: n.title ?? "",
        vendor: n.vendor ?? "",
        productType: n.productType ?? "",
        tags: n.tags ?? [],
        priceMin: minAmount,
        priceMax: maxAmount,
        currencyCode,
        variants,
        anyAvailable: variants.some((v) => v.availableForSale),
      };
    });

  const summary = buildSummary(searchTerm, products);
  const result: LookupResult = {
    searchTerm,
    cached: false,
    cacheKey,
    fetchedAt: new Date().toISOString(),
    products,
    summary,
  };

  // Best-effort cache write.
  if (redis) {
    try {
      await redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS });
    } catch (e) {
      console.warn("[lookupProducts] redis write failed:", e);
    }
  }

  return result;
}

/**
 * List ALL products visible to the Storefront API (i.e. everything Maria
 * can see). Paginates through Shopify's GraphQL until exhausted or until
 * `maxProducts` is reached. Used by the staff Catalog audit page.
 *
 * NOTE: this does NOT use the Redis cache — staff audits should always
 * see the freshest data. If you call this often, add caching.
 */
const LIST_ALL_QUERY = /* GraphQL */ `
  query ListAllProducts($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          title
          vendor
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 50) {
            edges {
              node {
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

type ListAllResponse = {
  data?: {
    products?: {
      pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
      edges?: GraphQLResponse["data"] extends infer T
        ? T extends { products?: { edges?: infer E } }
          ? E
          : never
        : never;
    };
  };
  errors?: Array<{ message: string }>;
};

export async function listAllProducts(maxProducts = 250): Promise<{
  products: StorefrontProduct[];
  fetchedAt: string;
  truncated: boolean;
}> {
  const { url, token } = getStorefrontConfig();
  const all: StorefrontProduct[] = [];
  let cursor: string | null = null;
  let truncated = false;

  // Hard safety limit on pagination loop.
  for (let page = 0; page < 10; page++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({
        query: LIST_ALL_QUERY,
        variables: { cursor },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Shopify request failed: ${res.status} ${res.statusText}`);
    }

    const body = (await res.json()) as ListAllResponse;
    if (body.errors?.length) {
      throw new Error(
        `Shopify GraphQL errors: ${body.errors.map((e) => e.message).join("; ")}`,
      );
    }

    const edges =
      (body.data?.products?.edges as
        | Array<{ node?: Record<string, unknown> }>
        | undefined) ?? [];

    for (const edge of edges) {
      const n = edge.node as
        | {
            title?: string;
            vendor?: string;
            productType?: string;
            tags?: string[];
            priceRange?: {
              minVariantPrice?: { amount?: string; currencyCode?: string };
              maxVariantPrice?: { amount?: string; currencyCode?: string };
            };
            variants?: {
              edges?: Array<{
                node?: {
                  title?: string;
                  price?: { amount?: string; currencyCode?: string };
                  availableForSale?: boolean;
                };
              }>;
            };
          }
        | undefined;

      if (!n) continue;

      const minAmount = Number(n.priceRange?.minVariantPrice?.amount ?? 0);
      const maxAmount = Number(n.priceRange?.maxVariantPrice?.amount ?? 0);
      const currencyCode =
        n.priceRange?.minVariantPrice?.currencyCode ?? "USD";

      const variants = (n.variants?.edges ?? [])
        .map((e) => e.node)
        .filter((v): v is NonNullable<typeof v> => Boolean(v))
        .map((v) => ({
          title: v.title ?? "",
          price: Number(v.price?.amount ?? 0),
          availableForSale: Boolean(v.availableForSale),
        }));

      all.push({
        title: n.title ?? "",
        vendor: n.vendor ?? "",
        productType: n.productType ?? "",
        tags: n.tags ?? [],
        priceMin: minAmount,
        priceMax: maxAmount,
        currencyCode,
        variants,
        anyAvailable: variants.some((v) => v.availableForSale),
      });

      if (all.length >= maxProducts) {
        truncated = true;
        break;
      }
    }

    if (truncated) break;
    const next = body.data?.products?.pageInfo;
    if (!next?.hasNextPage || !next.endCursor) break;
    cursor = next.endCursor;
  }

  return {
    products: all,
    fetchedAt: new Date().toISOString(),
    truncated,
  };
}

/**
 * Build a short, voice-friendly summary that Maria can speak directly
 * (or read as context for her response).
 */
function buildSummary(searchTerm: string, products: StorefrontProduct[]): string {
  if (products.length === 0) {
    return `No matching results found in our store for "${searchTerm}".`;
  }

  const lines: string[] = [
    `Found ${products.length} matching ${products.length === 1 ? "item" : "items"} for "${searchTerm}":`,
  ];

  for (const p of products.slice(0, 8)) {
    const priceStr =
      p.priceMin === p.priceMax
        ? `$${p.priceMin}`
        : `$${p.priceMin}–$${p.priceMax}`;

    const available = p.variants.filter((v) => v.availableForSale);
    const unavailable = p.variants.filter((v) => !v.availableForSale);

    let line = `- ${p.title} (${priceStr})`;
    if (p.anyAvailable) {
      if (available.length === p.variants.length || p.variants.length === 1) {
        line += " — available";
        if (available.length > 1) {
          line += ` in ${available
            .slice(0, 4)
            .map((v) => v.title)
            .join(", ")}`;
        }
      } else {
        line += ` — available: ${available
          .slice(0, 4)
          .map((v) => v.title)
          .join(", ")}`;
        if (unavailable.length > 0) {
          line += `; unavailable: ${unavailable
            .slice(0, 3)
            .map((v) => v.title)
            .join(", ")}`;
        }
      }
    } else {
      line += " — currently unavailable across all variants";
    }
    lines.push(line);
  }

  return lines.join("\n");
}
