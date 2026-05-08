import { NextResponse } from "next/server";
import crypto from "crypto";
import { isStaff } from "@/lib/auth";
import { recordPunch } from "@/lib/attendance";
import { EMPLOYEES, type Employee } from "@/lib/schedule";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/staff/identify
 * body: { employee: Employee | "__viewer", pin?: string }
 *
 * Verifies the per-employee PIN, sets the mm-staff-name cookie, and
 * automatically records a clock-in punch. The "__viewer" identity is
 * for managers and bypasses both the PIN check and clock-in.
 */
function timingSafeStrEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

const PIN_ENV: Record<Employee, string> = {
  Satya: "STAFF_PIN_SATYA",
  Niteesh: "STAFF_PIN_NITEESH",
  Bharath: "STAFF_PIN_BHARATH",
  Trainee: "STAFF_PIN_TRAINEE",
};

export async function POST(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate-limit PIN attempts per IP — slows brute-force.
  const ip = clientIpFrom(req);
  const rl = rateLimit(`staff-pin:${ip}`, 8, 5 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many tries. Wait 5 minutes." },
      { status: 429 },
    );
  }

  let body: { employee?: string; pin?: string };
  try {
    body = (await req.json()) as { employee?: string; pin?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const value = (body.employee ?? "").trim();

  // Manager view-only — no PIN, no clock-in.
  if (value === "__viewer") {
    const res = NextResponse.json({ ok: true, employee: value });
    res.cookies.set("mm-staff-name", value, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  if (!EMPLOYEES.includes(value as Employee)) {
    return NextResponse.json({ error: "Unknown employee" }, { status: 400 });
  }
  const employee = value as Employee;

  // Verify PIN
  const pin = (body.pin ?? "").trim();
  const expected = process.env[PIN_ENV[employee]];
  if (!expected) {
    return NextResponse.json(
      { error: `PIN not configured for ${employee}` },
      { status: 500 },
    );
  }
  if (!pin || !timingSafeStrEqual(pin, expected)) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  }

  // Auto-record clock-in. Already-clocked-in is fine — keep going.
  const result = await recordPunch(employee, "in");
  if (!result.ok && !/already clocked in/i.test(result.error)) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, employee });
  res.cookies.set("mm-staff-name", employee, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
