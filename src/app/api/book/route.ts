import { NextResponse } from "next/server";
import { generateReference, type BookingState } from "@/lib/booking";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";

/**
 * Booking submission endpoint.
 *
 * Hardening:
 *   - Rate limit: max 5 bookings per IP per hour
 *   - Honeypot field: silently rejects bot submissions
 *   - Input length caps: prevents oversized payloads
 *   - Strict validation: rejects missing or malformed fields
 *
 * Currently logs the booking server-side and returns a reference.
 * Replace the logging with a real integration (email, Slack, DB) when ready.
 */

export const runtime = "nodejs";

const MAX_NAME_LEN = 80;
const MAX_EMAIL_LEN = 200;
const MAX_PHONE_LEN = 30;
const MAX_DESC_LEN = 800;
const MAX_ISSUES = 20;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  // Rate limit: 5 submissions per hour per IP.
  const ip = clientIpFrom(req);
  const rl = rateLimit(`book:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many bookings from this address. Try again in an hour." },
      { status: 429 },
    );
  }

  let payload: BookingState & { _honeypot?: string };
  try {
    payload = (await req.json()) as BookingState & { _honeypot?: string };
  } catch {
    return bad("Invalid JSON");
  }

  // Honeypot: bots fill every field. Real users never see this field.
  if (payload._honeypot && payload._honeypot.length > 0) {
    // Pretend to succeed so bots don't retry.
    return NextResponse.json({ reference: generateReference() });
  }

  // Required fields
  if (!payload?.deviceType || !payload?.date || !payload?.time) {
    return bad("Missing required booking fields");
  }
  const c = payload.contact;
  if (!c?.name?.trim() || !c?.email?.trim() || !c?.phone?.trim()) {
    return bad("Missing contact details");
  }

  // Length caps — prevents oversized payloads from slipping through.
  if (
    c.name.length > MAX_NAME_LEN ||
    c.email.length > MAX_EMAIL_LEN ||
    c.phone.length > MAX_PHONE_LEN ||
    (payload.description?.length ?? 0) > MAX_DESC_LEN ||
    (payload.issues?.length ?? 0) > MAX_ISSUES
  ) {
    return bad("Field too long");
  }

  // Format checks
  if (!EMAIL_RE.test(c.email.trim())) return bad("Invalid email");
  if (!/^[\d+\-()\s.]{7,}$/.test(c.phone.trim())) return bad("Invalid phone");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date))
    return bad("Invalid date format");
  if (!/^\d{2}:\d{2}$/.test(payload.time))
    return bad("Invalid time format");

  const reference = generateReference();

  // Server-side log so the shop owner can see incoming bookings.
  // Replace with email/Slack/DB hook when ready.
  console.log("\n=========== NEW BOOKING ===========");
  console.log("Reference :", reference);
  console.log(
    "Device    :",
    payload.deviceType,
    payload.brand,
    payload.model,
    payload.customDevice ?? "",
  );
  console.log("Issues    :", payload.issues.join(", "));
  console.log("Notes     :", payload.description || "—");
  console.log("When      :", payload.date, payload.time);
  console.log("Customer  :", c.name, "·", c.email, "·", c.phone);
  console.log("From IP   :", ip);
  console.log("====================================\n");

  return NextResponse.json({ reference });
}
