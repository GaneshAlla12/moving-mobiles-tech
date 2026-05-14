import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import { listLeads } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/staff/leads
 *
 * Returns all customer leads captured by the n8n + VAPI AI agent
 * (stored in the "Customer Leads" tab of the Moving Mobiles Database
 * Google Sheet).
 *
 * Auth: requires staff cookie.
 */
export async function GET() {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await listLeads();
    return NextResponse.json({ leads });
  } catch (e) {
    console.error("[/api/staff/leads] error:", e);
    return NextResponse.json(
      {
        error: "Failed to fetch leads",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
