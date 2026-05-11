import { Redis } from "@upstash/redis";
import webpush, { type PushSubscription } from "web-push";

/**
 * Push helpers — store subscriptions in Upstash and fan out notifications
 * across two transports:
 *
 *   - Web Push (browsers / PWAs): VAPID-signed POST to the browser's push
 *     service endpoint (Mozilla, Google, Apple).
 *   - Expo Push (native iOS/Android via Expo): POST to Expo's HTTP/2
 *     gateway, which proxies to APNs + FCM. This is what the React
 *     Native staff app uses.
 *
 * One Upstash key holds both kinds; each subscription is tagged with a
 * `kind: "web" | "expo"` so we can route the send correctly.
 */

const KEY = "push:subscriptions";

export type WebSubscription = {
  kind: "web";
  endpoint: string; // browser push service URL — also serves as the unique ID
  keys: { p256dh: string; auth: string };
  owner?: string;
  createdAt: string;
};

export type ExpoSubscription = {
  kind: "expo";
  expoToken: string; // "ExponentPushToken[xxxxxxxxxxxx]" — also the unique ID
  owner?: string;
  createdAt: string;
};

export type StoredSubscription = WebSubscription | ExpoSubscription;

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isPushConfigured(): boolean {
  // Web push works iff VAPID is set. Expo works without VAPID.
  // We consider push "configured" if Redis is reachable; per-transport
  // checks happen at send time.
  return Boolean(getRedis());
}

function vapidConfigured() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT;
  if (!pub || !priv || !sub) return false;
  webpush.setVapidDetails(sub, pub, priv);
  return true;
}

/** Stable unique ID for a subscription — endpoint URL or Expo token. */
function idOf(s: StoredSubscription): string {
  return s.kind === "expo" ? s.expoToken : s.endpoint;
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

/** Accepts either a web subscription or an Expo token, stores deduped. */
export async function addSubscription(
  input:
    | {
        kind: "web";
        endpoint: string;
        keys: { p256dh: string; auth: string };
      }
    | { kind: "expo"; expoToken: string },
  owner?: string,
): Promise<{ ok: boolean; error?: string }> {
  const redis = getRedis();
  if (!redis) return { ok: false, error: "Storage not configured" };

  const newSub: StoredSubscription =
    input.kind === "expo"
      ? {
          kind: "expo",
          expoToken: input.expoToken,
          owner,
          createdAt: new Date().toISOString(),
        }
      : {
          kind: "web",
          endpoint: input.endpoint,
          keys: input.keys,
          owner,
          createdAt: new Date().toISOString(),
        };

  // Validate Expo token shape — defends against junk being stored
  if (newSub.kind === "expo") {
    if (
      !/^ExponentPushToken\[[A-Za-z0-9_-]+\]$|^ExpoPushToken\[[A-Za-z0-9_-]+\]$/.test(
        newSub.expoToken,
      )
    ) {
      return { ok: false, error: "Invalid Expo push token format" };
    }
  }

  try {
    const existing = await listSubscriptions();
    const without = existing.filter((s) => idOf(s) !== idOf(newSub));
    await redis.set(KEY, JSON.stringify([...without, newSub]));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "save failed" };
  }
}

export async function removeSubscription(
  identifier: string, // endpoint URL or Expo token
): Promise<{ ok: boolean }> {
  const redis = getRedis();
  if (!redis) return { ok: false };
  const existing = await listSubscriptions();
  const next = existing.filter((s) => idOf(s) !== identifier);
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
  byTransport: { web: number; expo: number };
}> {
  const subs = await listSubscriptions();
  if (subs.length === 0)
    return { sent: 0, failed: 0, pruned: 0, byTransport: { web: 0, expo: 0 } };

  let sent = 0;
  let failed = 0;
  const byTransport = { web: 0, expo: 0 };
  const expired: string[] = [];

  const webSubs = subs.filter((s): s is WebSubscription => s.kind === "web");
  const expoSubs = subs.filter((s): s is ExpoSubscription => s.kind === "expo");

  // Web push fan-out
  if (webSubs.length > 0 && vapidConfigured()) {
    const data = JSON.stringify(payload);
    await Promise.all(
      webSubs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: s.keys } as PushSubscription,
            data,
            { TTL: 60 * 60 },
          );
          sent++;
          byTransport.web++;
        } catch (e) {
          const status = (e as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) {
            expired.push(s.endpoint);
          } else {
            failed++;
            console.error("[push:web] send failed:", e);
          }
        }
      }),
    );
  }

  // Expo push fan-out — Expo accepts up to 100 tokens per request
  if (expoSubs.length > 0) {
    const chunks = chunk(expoSubs, 100);
    for (const group of chunks) {
      const messages = group.map((s) => ({
        to: s.expoToken,
        title: payload.title,
        body: payload.body ?? "",
        data: { url: payload.url ?? "/staff/appointments" },
        sound: "default" as const,
        priority: "high" as const,
        ttl: 3600,
        channelId: "default",
      }));
      try {
        const res = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
          },
          body: JSON.stringify(messages),
        });
        const json = (await res.json().catch(() => ({}))) as {
          data?: Array<{
            status?: "ok" | "error";
            id?: string;
            message?: string;
            details?: { error?: string };
          }>;
        };
        const tickets = json?.data ?? [];
        tickets.forEach((t, i) => {
          if (t.status === "ok") {
            sent++;
            byTransport.expo++;
          } else if (
            t.details?.error === "DeviceNotRegistered" ||
            t.details?.error === "InvalidCredentials"
          ) {
            expired.push(group[i].expoToken);
          } else {
            failed++;
            console.error("[push:expo] ticket error:", t);
          }
        });
      } catch (e) {
        failed += group.length;
        console.error("[push:expo] batch failed:", e);
      }
    }
  }

  if (expired.length) {
    const redis = getRedis();
    if (redis) {
      const remaining = subs.filter((s) => !expired.includes(idOf(s)));
      await redis.set(KEY, JSON.stringify(remaining));
    }
  }

  return { sent, failed, pruned: expired.length, byTransport };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
