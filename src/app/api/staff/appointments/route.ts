import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import { isCalConfigured, listBookings, type CalBooking } from "@/lib/cal-com";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/staff/appointments?view=upcoming  (default)
 *      /api/staff/appointments?view=past
 *
 * JSON API consumed by the native staff app. The /staff/appointments
 * web page renders the same data server-side; this is the headless
 * equivalent so a React Native / Expo client can fetch and render
 * natively.
 *
 * Auth: requires the staff cookie. Same gate as the web page.
 *
 * Response shape:
 *   {
 *     view: "upcoming" | "past",
 *     timeZone: string,        // shop TZ
 *     bookings: CalBooking[],  // sorted asc for upcoming, desc for past
 *     days: [{ date: "YYYY-MM-DD", bookings: CalBooking[] }]
 *   }
 */

const SHOP_TZ = process.env.CAL_COM_TIMEZONE ?? "America/New_York";

export async function GET(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isCalConfigured()) {
    return NextResponse.json(
      {
        view: "upcoming",
        timeZone: SHOP_TZ,
        bookings: [],
        days: [],
        configured: false,
      },
      { status: 200 },
    );
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") === "past" ? "past" : "upcoming";

  const now = new Date();
  const horizon = new Date();
  horizon.setDate(now.getDate() + 60);
  const past = new Date();
  past.setDate(now.getDate() - 60);

  const bookings =
    (await listBookings(
      view === "upcoming"
        ? {
            afterStart: now.toISOString(),
            beforeStart: horizon.toISOString(),
            status: ["upcoming"],
            take: 100,
          }
        : {
            afterStart: past.toISOString(),
            beforeStart: now.toISOString(),
            status: ["past", "cancelled"],
            take: 100,
          },
    )) ?? [];

  // Sort: upcoming asc, past desc
  const sorted = bookings.slice().sort((a, b) => {
    const ta = new Date(a.start).getTime();
    const tb = new Date(b.start).getTime();
    return view === "upcoming" ? ta - tb : tb - ta;
  });

  // Group by local YYYY-MM-DD in shop TZ
  const groups: Map<string, CalBooking[]> = new Map();
  for (const b of sorted) {
    const key = ymdInTz(b.start, SHOP_TZ);
    const arr = groups.get(key) ?? [];
    arr.push(b);
    groups.set(key, arr);
  }

  return NextResponse.json({
    view,
    timeZone: SHOP_TZ,
    bookings: sorted,
    days: Array.from(groups.entries()).map(([date, bookings]) => ({
      date,
      bookings,
    })),
    configured: true,
  });
}

function ymdInTz(utcIso: string, tz: string): string {
  const d = new Date(utcIso);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
