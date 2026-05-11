import { Redis } from "@upstash/redis";

/**
 * Weekly staff schedule — stored per ISO week in Upstash Redis.
 *
 * One entry per shift. Shifts are 5 hours; we store the start time and
 * compute the end on display so we never have inconsistent ranges.
 */

export const EMPLOYEES = ["Satya", "Niteesh", "Bharath", "Trainee", "Liv"] as const;
export type Employee = (typeof EMPLOYEES)[number];

/**
 * Who's allowed to edit the weekly schedule. Everyone else sees it in
 * read-only mode (and the API rejects PUTs from non-editors).
 */
export const SCHEDULE_EDITORS: Employee[] = ["Satya", "Bharath"];

export function canEditSchedule(employee: Employee | null | undefined): boolean {
  if (!employee) return false;
  return SCHEDULE_EDITORS.includes(employee);
}

export const SHIFT_HOURS = 5;

export type Shift = {
  /** YYYY-MM-DD (local date the shift falls on) */
  date: string;
  /** Employee name (must be one of EMPLOYEES) */
  employee: Employee;
  /** Start time in 24h HH:MM */
  startTime: string;
};

export type WeeklySchedule = {
  /** YYYY-MM-DD of the Monday of this week */
  weekStart: string;
  shifts: Shift[];
  updatedAt: string;
};

/** Common start times shown in the picker. Boss can also type a custom one. */
export const DEFAULT_START_TIMES = ["10:00", "12:00", "14:00"] as const;

const REDIS_KEY = (weekStart: string) => `schedule:${weekStart}`;

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function getWeeklySchedule(
  weekStart: string,
): Promise<WeeklySchedule | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return null;
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<WeeklySchedule | string>(REDIS_KEY(weekStart));
    if (!raw) return null;
    if (typeof raw === "string") return JSON.parse(raw) as WeeklySchedule;
    return raw as WeeklySchedule;
  } catch (e) {
    console.error("[schedule] get failed:", e);
    return null;
  }
}

export async function saveWeeklySchedule(
  weekStart: string,
  shifts: Shift[],
): Promise<{ ok: boolean; error?: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return { ok: false, error: "Invalid weekStart" };
  }
  const redis = getRedis();
  if (!redis) {
    return {
      ok: false,
      error:
        "Storage not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    };
  }
  // Validate
  if (!Array.isArray(shifts)) {
    return { ok: false, error: "shifts must be an array" };
  }
  for (const s of shifts) {
    if (!EMPLOYEES.includes(s.employee)) {
      return { ok: false, error: `Unknown employee: ${s.employee}` };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date)) {
      return { ok: false, error: "Invalid shift date" };
    }
    if (!/^\d{2}:\d{2}$/.test(s.startTime)) {
      return { ok: false, error: "Invalid shift start time" };
    }
  }

  const value: WeeklySchedule = {
    weekStart,
    shifts,
    updatedAt: new Date().toISOString(),
  };
  try {
    await redis.set(REDIS_KEY(weekStart), JSON.stringify(value));
    return { ok: true };
  } catch (e) {
    console.error("[schedule] save failed:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "save failed",
    };
  }
}

/**
 * Returns the Monday of the ISO week containing `date` as YYYY-MM-DD.
 */
export function mondayOf(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // Sunday → -6 ; Mon → 0 ; Tue → -1, etc.
  d.setDate(d.getDate() + diff);
  return formatYmd(d);
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Adds N days to a YYYY-MM-DD string. */
export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return formatYmd(dt);
}

/** Computes end time HH:MM = start + SHIFT_HOURS. */
export function endOfShift(startTime: string): string {
  const [h, m] = startTime.split(":").map(Number);
  const totalMin = h * 60 + m + SHIFT_HOURS * 60;
  const eh = Math.floor(totalMin / 60) % 24;
  const em = totalMin % 60;
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

/** "10:00" → "10 AM". Used for display. */
export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const am = h < 12;
  const hour12 = h % 12 || 12;
  return m === 0
    ? `${hour12} ${am ? "AM" : "PM"}`
    : `${hour12}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}
