import { NextResponse } from "next/server";
import { isStaff, getStaffIdentity } from "@/lib/auth";
import { markContacted, unmarkContacted } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/staff/leads/mark-contacted
 *
 * Body: {
 *   rowIndexes: number[],      // every row in this lead group (1-indexed)
 *   action: "contacted" | "uncontacted"
 * }
 *
 * Marks every row in a customer-lead group as Contacted (or reverts to New).
 * A "group" = all rows with the same phone+email — Maria sometimes saves a
 * lead 2-3 times during a single call, so we update all of them at once
 * to keep the staff page tidy.
 */
export async function POST(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identity = await getStaffIdentity();
  const contactedBy =
    identity?.kind === "employee" ? identity.name : "viewer";

  let body: { rowIndexes?: unknown; rowIndex?: unknown; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // Accept either rowIndexes (array) or legacy rowIndex (single number).
  let rowIndexes: number[] = [];
  if (Array.isArray(body.rowIndexes)) {
    rowIndexes = body.rowIndexes
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n) && n >= 2);
  } else if (Number.isInteger(Number(body.rowIndex))) {
    rowIndexes = [Number(body.rowIndex)];
  }

  if (rowIndexes.length === 0) {
    return NextResponse.json(
      { error: "rowIndexes must be a non-empty array of integers >= 2" },
      { status: 400 },
    );
  }

  const action = body.action === "uncontacted" ? "uncontacted" : "contacted";

  try {
    if (action === "uncontacted") {
      const r = await unmarkContacted({ rowIndexes });
      return NextResponse.json({ ok: true, action, count: r.count });
    }
    const r = await markContacted({ rowIndexes, contactedBy });
    return NextResponse.json({
      ok: true,
      action,
      contactedBy,
      count: r.count,
    });
  } catch (e) {
    console.error("[/api/staff/leads/mark-contacted] error:", e);
    return NextResponse.json(
      {
        error: "Failed to update lead",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
