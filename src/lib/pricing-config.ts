import { Redis } from "@upstash/redis";
import { brands as defaultBrands, type Brand } from "./repair-pricing";

/**
 * Repair-pricing overrides — sparse map keyed by
 * `${brandKey}|${modelKey}|${serviceLine}` → price (USD).
 *
 * Defaults live in `repair-pricing.ts`. Anything saved here wins on
 * the public /repair-cost page. Boss edits via /staff/pricing.
 */

const KEY = "mm:pricing-overrides";

export type PricingOverrides = {
  prices: Record<string, number>;
  updatedAt: string;
};

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isPricingConfigured(): boolean {
  return getRedis() !== null;
}

export async function getPricingOverrides(): Promise<PricingOverrides | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<PricingOverrides | string>(KEY);
    if (!raw) return null;
    if (typeof raw === "string") return JSON.parse(raw) as PricingOverrides;
    return raw as PricingOverrides;
  } catch (e) {
    console.error("[pricing] get failed:", e);
    return null;
  }
}

export async function savePricingOverrides(
  prices: Record<string, number>,
): Promise<{ ok: boolean; error?: string }> {
  const redis = getRedis();
  if (!redis) {
    return {
      ok: false,
      error:
        "Storage not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    };
  }
  // Validate
  for (const [k, v] of Object.entries(prices)) {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 99999) {
      return { ok: false, error: `Invalid price for ${k}: ${v}` };
    }
    const parts = k.split("|");
    if (parts.length !== 3 || parts.some((p) => !p)) {
      return { ok: false, error: `Invalid override key: ${k}` };
    }
  }

  const value: PricingOverrides = {
    prices,
    updatedAt: new Date().toISOString(),
  };
  try {
    await redis.set(KEY, JSON.stringify(value));
    return { ok: true };
  } catch (e) {
    console.error("[pricing] save failed:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "save failed",
    };
  }
}

/** Build the override key for a given price cell. */
export function priceKey(
  brandKey: string,
  modelKey: string,
  serviceLine: string,
): string {
  return `${brandKey}|${modelKey}|${serviceLine}`;
}

/**
 * Returns brands with prices merged: defaults are used unless a saved
 * override exists for that exact (brand, model, line) cell.
 */
export async function getEffectiveBrands(): Promise<Brand[]> {
  const o = await getPricingOverrides();
  if (!o) return defaultBrands;
  return defaultBrands.map((b) => ({
    ...b,
    models: b.models.map((m) => ({
      ...m,
      prices: Object.fromEntries(
        b.serviceLines.map((line) => {
          const k = priceKey(b.key, m.key, line);
          const overridden = o.prices[k];
          return [
            line,
            typeof overridden === "number" ? overridden : (m.prices[line] ?? 0),
          ];
        }),
      ),
    })),
  }));
}
