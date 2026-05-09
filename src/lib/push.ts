import { Redis } from "@upstash/redis";
import webpush, { type PushSubscription } from "web-push";

/**
 * Web Push helpers — store browser subscriptions in Upstash and fan out
 * notifications to all of them when something happens (e.g. a new
 * Cal.com booking).
 *
 * Subscription endpoints are unique per browser/device — Satya's iPhone,
 * Satya's iPad, and Niteesh's Android each get their own row.
 */

const KEY = "push:subscriptions";

export type StoredSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  /** Optional employee name for filtering */
  owner?: string;
  createdAt: string;
};

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT &&
      getRedis(),
  );
}

function vapidConfigured() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT;
  if (!pub || !priv || !sub) return false;
  webpush.setVapidDetails(sub, pub, priv);
  return true;
}

export async function listSubscriptions(): Promise<StoredSubscription[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.get<StoredSubscription[] | string>(KEY);
    if (!raw) return [];
    if (typeof raw === "string") return JSON.parse(raw) as StoredSubscription[];
    return raw as StoredSubscription[];
  } catch {
    return [];
  }
}

export async function addSubscription(
  sub: PushSubscription & { keys: { p256dh: string; auth: string } },
  owner?: string,
): Promise<{ ok: boolean; error?: string }> {
  const redis = getRedis();
  if (!redis) return { ok: false, error: "Storage not configured" };
  try {
    const existing = await listSubscriptions();
    // Dedupe by endpoint (same device re-subscribes)
    const without = existing.filter((s) => s.endpoint !== sub.endpoint);
    const next: StoredSubscription[] = [
      ...without,
      {
        endpoint: sub.endpoint,
        keys: sub.keys,
        owner,
        createdAt: new Date().toISOString(),
      },
    ];
    await redis.set(KEY, JSON.stringify(next));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "save failed" };
  }
}

export async function removeSubscription(
  endpoint: string,
): Promise<{ ok: boolean }> {
  const redis = getRedis();
  if (!redis) return { ok: false };
  const existing = await listSubscriptions();
  const next = existing.filter((s) => s.endpoint !== endpoint);
  if (next.length === existing.length) return { ok: true };
  await redis.set(KEY, JSON.stringify(next));
  return { ok: true };
}

export type PushPayload = {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
};

export async function sendPushToAll(payload: PushPayload): Promise<{
  sent: number;
  failed: number;
  pruned: number;
}> {
  if (!vapidConfigured()) return { sent: 0, failed: 0, pruned: 0 };
  const subs = await listSubscriptions();
  if (subs.length === 0) return { sent: 0, failed: 0, pruned: 0 };

  const data = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys } as PushSubscription,
          data,
          { TTL: 60 * 60 },
        );
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          // Subscription gone — remove it
          expired.push(s.endpoint);
        } else {
          failed++;
          console.error("[push] send failed:", e);
        }
      }
    }),
  );

  if (expired.length) {
    const redis = getRedis();
    if (redis) {
      const remaining = subs.filter((s) => !expired.includes(s.endpoint));
      await redis.set(KEY, JSON.stringify(remaining));
    }
  }

  return { sent, failed, pruned: expired.length };
}
