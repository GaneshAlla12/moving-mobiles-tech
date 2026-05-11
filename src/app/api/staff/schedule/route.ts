import { NextResponse } from "next/server";
import { isStaff, getStaffIdentity } from "@/lib/auth";
import {
  canEditSchedule,
  getWeeklySchedule,
  saveWeeklySchedule,
  type Shift,
} from "@/lib/schedule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/staff/schedule?week=YYYY-MM-DD  (week = Monday ISO)
 * PUT /api/staff/schedule  body: { weekStart: string, shifts: Shift[] }
 *
 * Both require an active staff session.
 */

export async function GET(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const week = url.searchParams.get("week");
  if (!week || !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return NextResponse.json({ error: "Invalid week" }, { status: 400 });
  }
  const data = await getWeeklySchedule(week);
  return NextResponse.json({ schedule: data });
}

export async function PUT(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Only certain employees can save the schedule. Others can read it
  // (GET above) but cannot mutate.
  const identity = await getStaffIdentity();
  const editor =
    identity?.kind === "employee" ? identity.name : null;
  if (!canEditSchedule(editor)) {
    return NextResponse.json(
      {
        error:
          "Only Satya and Bharath can edit the schedule. You're signed in as " +
          (editor ?? "a viewer") +
          ".",
      },
      { status: 403 },
    );
  }
  let body: { weekStart?: string; shifts?: Shift[] };
  try {
    body = (await req.json()) as { weekStart?: string; shifts?: Shift[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.weekStart || !Array.isArray(body.shifts)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const result = await saveWeeklySchedule(body.weekStart, body.shifts);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
