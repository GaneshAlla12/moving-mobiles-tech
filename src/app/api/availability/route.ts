import { NextResponse } from "next/server";
import { getAvailableSlots, isCalConfigured } from "@/lib/cal-com";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/availability?date=YYYY-MM-DD
 *
 * Returns available time slots for a given local date. When Cal.com is
 * configured, queries Cal.com slots API. Otherwise returns null so the
 * client falls back to its in-hours slot generator.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  if (!isCalConfigured()) {
    return NextResponse.json({ configured: false, slots: null });
  }

  const slots = await getAvailableSlots(date);
  return NextResponse.json({
    configured: true,
    slots: slots ?? [],
  });
}
