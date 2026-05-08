import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import {
  getDayLog,
  recordPunch,
  summarize,
  todayInShopTz,
} from "@/lib/attendance";
import { EMPLOYEES, type Employee } from "@/lib/schedule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/staff/attendance?date=YYYY-MM-DD  → { log, summaries }
 * POST /api/staff/attendance                 body: { employee, type: "in"|"out" }
 */

export async function GET(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const date = url.searchParams.get("date") || todayInShopTz();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const log = await getDayLog(date);
  if (!log) {
    return NextResponse.json({
      log: null,
      summaries: [],
      configured: false,
    });
  }
  return NextResponse.json({
    log,
    summaries: summarize(log),
    configured: true,
  });
}

export async function POST(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { employee?: string; type?: "in" | "out" };
  try {
    body = (await req.json()) as { employee?: string; type?: "in" | "out" };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.employee || (body.type !== "in" && body.type !== "out")) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!EMPLOYEES.includes(body.employee as Employee)) {
    return NextResponse.json({ error: "Unknown employee" }, { status: 400 });
  }
  const result = await recordPunch(body.employee as Employee, body.type);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, punch: result.punch });
}
