import { Redis } from "@upstash/redis";
import { EMPLOYEES, type Employee } from "./schedule";

/**
 * Time-clock attendance — append-only punch log per local day.
 *
 * Storage: one Upstash Redis key per day,
 *   `attendance:YYYY-MM-DD` → JSON array of Punch
 *
 * Each punch is a single tap of "Clock in" or "Clock out". The list is
 * naturally ordered by time. Status helpers compute who's currently
 * clocked in by walking the day's punches.
 */

export type PunchType = "in" | "out";

export type Punch = {
  employee: Employee;
  type: PunchType;
  /** ISO UTC timestamp of the punch */
  timestamp: string;
  /** Local date (YYYY-MM-DD in shop TZ) the punch belongs to */
  date: string;
};

export type DayLog = {
  date: string;
  punches: Punch[];
  updatedAt: string;
};

/** Returns currently-active status per employee on a given day. */
export type EmployeeDaySummary = {
  employee: Employee;
  /** in = currently clocked in; out = clocked out; off = no punches today */
  status: "in" | "out" | "off";
  /** Most recent punch (for showing "Signed in at 10:04 AM") */
  lastPunch?: Punch;
  /** Total minutes worked today (sum of all closed in/out pairs + any open one) */
  minutesWorked: number;
  /** Pairs of (in, out) with optional unclosed in */
  segments: Array<{ in: Punch; out?: Punch }>;
};

const KEY = (date: string) => `attendance:${date}`;
const SHOP_TZ = process.env.CAL_COM_TIMEZONE ?? "America/New_York";

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isAttendanceConfigured(): boolean {
  return getRedis() !== null;
}

export async function getDayLog(date: string): Promise<DayLog | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<DayLog | string>(KEY(date));
    if (!raw) return { date, punches: [], updatedAt: new Date().toISOString() };
    if (typeof raw === "string") return JSON.parse(raw) as DayLog;
    return raw as DayLog;
  } catch (e) {
    console.error("[attendance] get failed:", e);
    return null;
  }
}

export async function recordPunch(
  employee: Employee,
  type: PunchType,
): Promise<{ ok: true; punch: Punch } | { ok: false; error: string }> {
  if (!EMPLOYEES.includes(employee)) {
    return { ok: false, error: `Unknown employee: ${employee}` };
  }
  const redis = getRedis();
  if (!redis) {
    return {
      ok: false,
      error:
        "Storage not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    };
  }
  const now = new Date();
  const date = ymdInTz(now, SHOP_TZ);
  const punch: Punch = {
    employee,
    type,
    timestamp: now.toISOString(),
    date,
  };
  try {
    const existing = await redis.get<DayLog | string>(KEY(date));
    let log: DayLog;
    if (!existing) {
      log = { date, punches: [], updatedAt: now.toISOString() };
    } else if (typeof existing === "string") {
      log = JSON.parse(existing) as DayLog;
    } else {
      log = existing as DayLog;
    }

    // Reject duplicate transitions: can't clock in twice in a row, etc.
    const lastForEmployee = [...log.punches]
      .reverse()
      .find((p) => p.employee === employee);
    if (lastForEmployee && lastForEmployee.type === type) {
      return {
        ok: false,
        error:
          type === "in"
            ? `${employee} is already clocked in.`
            : `${employee} is already clocked out.`,
      };
    }

    log.punches.push(punch);
    log.updatedAt = now.toISOString();
    await redis.set(KEY(date), JSON.stringify(log));
    return { ok: true, punch };
  } catch (e) {
    console.error("[attendance] punch failed:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "punch failed",
    };
  }
}

/** Build per-employee summaries from a day's punch log. */
export function summarize(log: DayLog): EmployeeDaySummary[] {
  return EMPLOYEES.map((employee) => {
    const punches = log.punches
      .filter((p) => p.employee === employee)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const segments: EmployeeDaySummary["segments"] = [];
    let openIn: Punch | null = null;
    for (const p of punches) {
      if (p.type === "in") {
        if (openIn) {
          // Two ins in a row — keep the latest as open (shouldn't happen due to validation)
          segments.push({ in: openIn });
        }
        openIn = p;
      } else if (p.type === "out") {
        if (openIn) {
          segments.push({ in: openIn, out: p });
          openIn = null;
        } else {
          // Out without a prior in — record as orphan (count as 0 mins)
        }
      }
    }
    if (openIn) segments.push({ in: openIn });

    let minutesWorked = 0;
    for (const seg of segments) {
      const start = new Date(seg.in.timestamp).getTime();
      const end = seg.out
        ? new Date(seg.out.timestamp).getTime()
        : Date.now();
      minutesWorked += Math.max(0, Math.round((end - start) / 60000));
    }

    const lastPunch = punches[punches.length - 1];
    const status: EmployeeDaySummary["status"] = !lastPunch
      ? "off"
      : lastPunch.type === "in"
        ? "in"
        : "out";

    return {
      employee,
      status,
      lastPunch,
      minutesWorked,
      segments,
    };
  });
}

/** Returns the local YYYY-MM-DD in shop TZ for "right now". */
export function todayInShopTz(): string {
  return ymdInTz(new Date(), SHOP_TZ);
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTimeShort(iso: string, tz: string = SHOP_TZ): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function ymdInTz(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
