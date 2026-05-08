/**
 * Cal.com integration — slots + bookings.
 *
 * Uses Cal.com v2 REST API. Requires:
 *   - CAL_COM_API_KEY        (Bearer token from Settings → Developer → API Keys)
 *   - CAL_COM_EVENT_TYPE_ID  (numeric ID of the "Repair appointment" event type)
 *   - CAL_COM_TIMEZONE       (IANA tz, defaults to America/New_York)
 *
 * If env vars are missing, helpers return null/false so callers can fall back
 * to current behavior (seeing all in-hours slots, logging bookings).
 */

const BASE = "https://api.cal.com/v2";
const TZ = process.env.CAL_COM_TIMEZONE ?? "America/New_York";

function config():
  | { apiKey: string; eventTypeId: number; tz: string }
  | null {
  const apiKey = process.env.CAL_COM_API_KEY;
  const eventTypeIdRaw = process.env.CAL_COM_EVENT_TYPE_ID;
  if (!apiKey || !eventTypeIdRaw) return null;
  const eventTypeId = Number(eventTypeIdRaw);
  if (!Number.isFinite(eventTypeId)) return null;
  return { apiKey, eventTypeId, tz: TZ };
}

export function isCalConfigured(): boolean {
  return config() !== null;
}

async function calFetch(
  path: string,
  init: RequestInit & { apiKey: string; apiVersion?: string },
): Promise<Response> {
  const { apiKey, apiVersion, ...rest } = init;
  return fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "cal-api-version": apiVersion ?? "2024-08-13",
      ...(rest.headers ?? {}),
    },
    cache: "no-store",
  });
}

/**
 * Returns ISO start times of all available slots for a given local date
 * (YYYY-MM-DD). The shop's TZ is applied so "2026-05-08" means that day
 * in America/New_York.
 *
 * Returns `null` if Cal.com is not configured (caller should fall back).
 */
export async function getAvailableSlots(
  dateIso: string,
): Promise<{ time: string; startUtc: string }[] | null> {
  const cfg = config();
  if (!cfg) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return [];

  const params = new URLSearchParams({
    eventTypeId: String(cfg.eventTypeId),
    start: `${dateIso}T00:00:00`,
    end: `${dateIso}T23:59:59`,
    timeZone: cfg.tz,
  });

  try {
    const res = await calFetch(`/slots?${params.toString()}`, {
      method: "GET",
      apiKey: cfg.apiKey,
      apiVersion: "2024-09-04",
    });
    if (!res.ok) {
      console.error("[cal] slots failed", res.status, await res.text());
      return [];
    }
    const json = await res.json();
    // Cal.com returns: { status: "success", data: { "2026-05-08": [{ start: "..." }, ...] } }
    const day = json?.data?.[dateIso];
    if (!Array.isArray(day)) return [];
    return day
      .map((s: { start?: string; time?: string }) => {
        const startUtc = s.start ?? s.time;
        if (!startUtc) return null;
        // Convert UTC start time to local HH:MM in the shop's TZ
        const time = utcToLocalHHMM(startUtc, cfg.tz);
        return { time, startUtc };
      })
      .filter(Boolean) as { time: string; startUtc: string }[];
  } catch (e) {
    console.error("[cal] slots error", e);
    return [];
  }
}

export type CreateBookingInput = {
  /** ISO datetime in UTC, e.g. "2026-05-08T15:00:00.000Z" */
  start: string;
  /** Customer name */
  name: string;
  /** Customer email */
  email: string;
  /** Customer phone */
  phone: string;
  /** Free-form notes added to the event (device, issues, etc.) */
  notes: string;
  /** Optional metadata stored on the booking */
  metadata?: Record<string, string>;
};

export type CreateBookingResult =
  | { ok: true; uid: string }
  | { ok: false; error: string; status?: number };

export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const cfg = config();
  if (!cfg) return { ok: false, error: "Cal.com not configured" };

  const body = {
    start: input.start,
    eventTypeId: cfg.eventTypeId,
    attendee: {
      name: input.name,
      email: input.email,
      timeZone: cfg.tz,
      phoneNumber: input.phone,
      language: "en",
    },
    bookingFieldsResponses: {
      notes: input.notes,
    },
    metadata: input.metadata ?? {},
  };

  try {
    const res = await calFetch("/bookings", {
      method: "POST",
      apiKey: cfg.apiKey,
      apiVersion: "2026-02-25",
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        json?.error?.message ?? json?.message ?? `HTTP ${res.status}`;
      console.error("[cal] booking failed", res.status, json);
      return { ok: false, error: message, status: res.status };
    }
    const uid: string | undefined = json?.data?.uid ?? json?.uid;
    if (!uid) return { ok: false, error: "No booking UID returned" };
    return { ok: true, uid };
  } catch (e) {
    console.error("[cal] booking error", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export type CalBooking = {
  id: number;
  uid: string;
  status: string;
  start: string; // ISO UTC
  end: string;
  duration: number;
  /** Note text — we put device + issues here on submission */
  description?: string;
  /** Structured fields we sent on create */
  metadata?: {
    reference?: string;
    deviceType?: string;
    brand?: string;
    model?: string;
    customDevice?: string;
    issues?: string;
    [k: string]: string | undefined;
  };
  attendees: Array<{
    name: string;
    email: string;
    timeZone?: string;
  }>;
  cancellationReason?: string;
  rescheduledByEmail?: string | null;
  meetingUrl?: string;
};

/**
 * Lists bookings for our event type, in a given UTC date range.
 * Returns null when Cal.com is not configured.
 */
export async function listBookings(opts: {
  /** ISO UTC, e.g. "2026-05-01T00:00:00.000Z" */
  afterStart?: string;
  beforeStart?: string;
  /** "accepted" | "cancelled" | "rejected" — Cal.com supports multiple */
  status?: string[];
  take?: number;
}): Promise<CalBooking[] | null> {
  const cfg = config();
  if (!cfg) return null;

  const params = new URLSearchParams();
  params.set("eventTypeIds", String(cfg.eventTypeId));
  params.set("take", String(opts.take ?? 50));
  params.set("sortStart", "asc");
  if (opts.afterStart) params.set("afterStart", opts.afterStart);
  if (opts.beforeStart) params.set("beforeStart", opts.beforeStart);
  if (opts.status?.length) {
    for (const s of opts.status) params.append("status", s);
  }

  try {
    const res = await calFetch(`/bookings?${params.toString()}`, {
      method: "GET",
      apiKey: cfg.apiKey,
      apiVersion: "2024-08-13",
    });
    if (!res.ok) {
      console.error("[cal] list bookings failed", res.status, await res.text());
      return [];
    }
    const json = await res.json();
    const data = json?.data;
    if (!Array.isArray(data)) return [];
    return data as CalBooking[];
  } catch (e) {
    console.error("[cal] list bookings error", e);
    return [];
  }
}

/**
 * Converts a UTC ISO timestamp to a local HH:MM string in the given IANA TZ.
 * Uses Intl.DateTimeFormat which is reliable across all runtimes.
 */
function utcToLocalHHMM(utcIso: string, tz: string): string {
  const d = new Date(utcIso);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  // 24h "24:30" can occur on midnight rollover — normalize
  return `${h === "24" ? "00" : h}:${m}`;
}
