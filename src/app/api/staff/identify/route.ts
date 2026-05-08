import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import { recordPunch } from "@/lib/attendance";
import { EMPLOYEES, type Employee } from "@/lib/schedule";

export const runtime = "nodejs";

/**
 * POST /api/staff/identify
 * body: { employee: Employee | "__viewer" }
 *
 * Sets the mm-staff-name cookie. When an employee identifies themselves,
 * we record an automatic "clock in" punch. The "__viewer" identity is
 * used by managers who don't need time tracking.
 */
export async function POST(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { employee?: string };
  try {
    body = (await req.json()) as { employee?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const value = (body.employee ?? "").trim();

  if (value !== "__viewer" && !EMPLOYEES.includes(value as Employee)) {
    return NextResponse.json({ error: "Unknown employee" }, { status: 400 });
  }

  // Auto-record clock-in for employees. If they were already clocked in
  // (e.g. a stale session), the punch lib's idempotency check rejects it
  // and we just ignore — they're still considered signed in.
  if (value !== "__viewer") {
    const result = await recordPunch(value as Employee, "in");
    if (!result.ok && !/already clocked in/i.test(result.error)) {
      // Real error (storage misconfig, etc.) — surface it
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  }

  const res = NextResponse.json({ ok: true, employee: value });
  res.cookies.set("mm-staff-name", value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30d
  });
  return res;
}
