import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { recordPunch } from "@/lib/attendance";
import { EMPLOYEES, type Employee } from "@/lib/schedule";

export const runtime = "nodejs";

/**
 * POST /api/staff/logout
 *
 * If the current session is identified as an employee, automatically
 * record a "clock out" punch before clearing the cookies. View-only
 * (manager) sessions just clear cookies — no punch.
 */
export async function POST() {
  const store = await cookies();
  const name = store.get("mm-staff-name")?.value;

  if (name && name !== "__viewer" && EMPLOYEES.includes(name as Employee)) {
    try {
      await recordPunch(name as Employee, "out");
    } catch (e) {
      console.error("[logout] clock-out failed:", e);
    }
  }

  const res = NextResponse.json({ ok: true });
  for (const cookie of ["mm-staff", "mm-staff-name"]) {
    res.cookies.set(cookie, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
  return res;
}
