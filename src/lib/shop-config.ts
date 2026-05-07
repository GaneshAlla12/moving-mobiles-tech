import { Redis } from "@upstash/redis";

/**
 * Shop layout config — controls which collections appear on /shop,
 * in what order, and which 6 products each collection's carousel shows.
 *
 * Persisted in Upstash Redis. Edits via /staff/shop. Falls back to the
 * default order in collection-labels.ts when not configured yet.
 */

export type CollectionConfig = {
  /** Shopify collection handle */
  handle: string;
  /** Hide this collection from /shop (still accessible by direct URL) */
  hidden?: boolean;
  /** Product IDs to show in the carousel, in this order. Empty = use default. Max 6. */
  featured: number[];
};

export type ShopConfig = {
  collections: CollectionConfig[];
  updatedAt: string;
};

const KEY = "mm:shop-config";
export const MAX_FEATURED = 6;

/** Returns a Redis client only when Upstash env vars are set, else null.
 *
 * Accepts either Upstash's native variable names (UPSTASH_REDIS_REST_*)
 * or Vercel KV's compatibility names (KV_REST_API_*) — Upstash sometimes
 * shows both in their dashboard.
 */
function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function getShopConfig(): Promise<ShopConfig | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<ShopConfig | string>(KEY);
    if (!raw) return null;
    // Upstash auto-deserializes JSON on .get; handle both shapes safely.
    if (typeof raw === "string") return JSON.parse(raw) as ShopConfig;
    return raw as ShopConfig;
  } catch (e) {
    console.error("[shop-config] get failed:", e);
    return null;
  }
}

export async function saveShopConfig(
  config: Omit<ShopConfig, "updatedAt">,
): Promise<{ ok: boolean; error?: string }> {
  const redis = getRedis();
  if (!redis) {
    return {
      ok: false,
      error:
        "Storage not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel.",
    };
  }
  // Validate
  if (!Array.isArray(config.collections)) {
    return { ok: false, error: "collections must be an array" };
  }
  for (const c of config.collections) {
    if (typeof c.handle !== "string" || !c.handle) {
      return { ok: false, error: "Each collection must have a handle" };
    }
    if (!Array.isArray(c.featured)) {
      return { ok: false, error: "featured must be an array of product IDs" };
    }
    if (c.featured.length > MAX_FEATURED) {
      return {
        ok: false,
        error: `Max ${MAX_FEATURED} featured products per collection`,
      };
    }
    if (!c.featured.every((id) => typeof id === "number")) {
      return { ok: false, error: "featured product IDs must be numbers" };
    }
  }

  const toStore: ShopConfig = {
    collections: config.collections,
    updatedAt: new Date().toISOString(),
  };
  try {
    await redis.set(KEY, JSON.stringify(toStore));
    return { ok: true };
  } catch (e) {
    console.error("[shop-config] set failed:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "save failed",
    };
  }
}

/** True if Upstash is configured (used to show "setup required" UI). */
export function isShopConfigConfigured(): boolean {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return Boolean(url && token);
}
