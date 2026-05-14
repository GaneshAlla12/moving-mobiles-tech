import { NextResponse } from "next/server";
import {
  findLatestLeadRowIndexesByPhone,
  markCallStatus,
} from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * VAPI server-message webhook.
 *
 * Configure in VAPI dashboard → assistant → "Server URL" =
 *   https://www.movingmobiles.com/api/vapi/events
 *
 * VAPI sends server-message events for every call (start, status updates,
 * end-of-call-report, etc). We only care about the **end-of-call-report** and
 * **transfer-destination-call.ended** events, which let us detect whether a
 * transfer to the store was answered or missed.
 *
 * When a transfer is detected as missed (no answer / busy / hung up before
 * conversation), we mark the matching lead in Google Sheets with
 * Call Status = "Missed". The staff page then shows it as an URGENT
 * Callback at the top of the list.
 *
 * VAPI auth: optional. If VAPI_WEBHOOK_SECRET is set in env, we require it
 * in the `x-vapi-secret` header. Otherwise the endpoint is open (VAPI's
 * URL is hard to discover, but a shared secret is recommended in prod).
 */

const MISSED_END_REASONS = new Set([
  // VAPI's end reasons for transfers that didn't complete.
  // We accept variants since VAPI's exact strings can change.
  "transfer-call-no-answer",
  "transfer-no-answer",
  "transfer-call-busy",
  "transfer-busy",
  "transfer-failed",
  "transfer-call-failed",
  "phone-call-provider-transfer-failed",
  "no-answer",
  "busy",
]);

const CONNECTED_END_REASONS = new Set([
  "transfer-call-ended",
  "transfer-ended",
  "transfer-completed",
  "transfer-success",
  "customer-ended-transfer",
]);

type WebhookPayload = {
  message?: {
    type?: string;
    endedReason?: string;
    call?: {
      id?: string;
      endedReason?: string;
      customer?: { number?: string };
      transcript?: string;
    };
    customer?: { number?: string };
    transcript?: string;
  };
  // Some VAPI configs send fields at top level instead of under "message".
  type?: string;
  endedReason?: string;
  call?: {
    id?: string;
    endedReason?: string;
    customer?: { number?: string };
  };
};

export async function POST(req: Request) {
  // Optional shared-secret check.
  const expected = process.env.VAPI_WEBHOOK_SECRET;
  if (expected) {
    const got = req.headers.get("x-vapi-secret");
    if (got !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messageType = payload.message?.type ?? payload.type ?? "";
  const endedReason =
    payload.message?.endedReason ??
    payload.message?.call?.endedReason ??
    payload.endedReason ??
    payload.call?.endedReason ??
    "";
  const customerPhone =
    payload.message?.call?.customer?.number ??
    payload.message?.customer?.number ??
    payload.call?.customer?.number ??
    "";

  // Only act on call-end-like events.
  const isEndEvent =
    messageType.includes("end-of-call") ||
    messageType.includes("status-update") ||
    messageType === "call-ended" ||
    messageType === "transfer-destination-request" ||
    messageType.includes("transfer");

  if (!isEndEvent || !endedReason) {
    return NextResponse.json({ ok: true, handled: false });
  }

  let callStatus: "Missed" | "Connected" | "" = "";
  if (MISSED_END_REASONS.has(endedReason.toLowerCase())) {
    callStatus = "Missed";
  } else if (CONNECTED_END_REASONS.has(endedReason.toLowerCase())) {
    callStatus = "Connected";
  } else {
    // Heuristic fallback: any endedReason that mentions "transfer" AND
    // "no-answer" / "busy" / "failed" should count as missed.
    const lower = endedReason.toLowerCase();
    if (
      lower.includes("transfer") &&
      (lower.includes("no-answer") ||
        lower.includes("noanswer") ||
        lower.includes("busy") ||
        lower.includes("failed") ||
        lower.includes("declined"))
    ) {
      callStatus = "Missed";
    }
  }

  if (!callStatus) {
    return NextResponse.json({ ok: true, handled: false, endedReason });
  }

  if (!customerPhone) {
    console.warn("[/api/vapi/events] no customer phone in payload", {
      endedReason,
      callStatus,
    });
    return NextResponse.json({
      ok: true,
      handled: false,
      reason: "No customer phone in payload",
    });
  }

  try {
    const rowIndexes = await findLatestLeadRowIndexesByPhone(customerPhone, {
      withinMinutes: 60,
    });
    if (rowIndexes.length === 0) {
      console.warn("[/api/vapi/events] no lead row found for phone", {
        customerPhone,
        endedReason,
      });
      return NextResponse.json({
        ok: true,
        handled: false,
        reason: "No matching lead row within last 60 min",
      });
    }
    await markCallStatus({ rowIndexes, status: callStatus });
    return NextResponse.json({
      ok: true,
      handled: true,
      callStatus,
      rowsUpdated: rowIndexes.length,
    });
  } catch (e) {
    console.error("[/api/vapi/events] failed to update sheet", e);
    return NextResponse.json(
      {
        error: "Failed to update sheet",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}

/** Health-check endpoint so you can confirm the URL is reachable from VAPI. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "vapi-events",
    description:
      "POST endpoint that catches VAPI server messages and flags missed transfers.",
  });
}
