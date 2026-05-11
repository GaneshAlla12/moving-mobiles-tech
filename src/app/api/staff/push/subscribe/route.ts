import { NextResponse } from "next/server";
import { isStaff, getStaffIdentity } from "@/lib/auth";
import { addSubscription, removeSubscription } from "@/lib/push";

export const runtime = "nodejs";

/**
 * POST /api/staff/push/subscribe
 *
 * Accepts two payload shapes:
 *
 *   1. Web push (browsers / PWAs):
 *      { subscription: { endpoint, keys: { p256dh, auth } } }
 *
 *   2. Expo push (native iOS/Android via Expo):
 *      { subscription: { type: "expo", expoToken: "ExponentPushToken[...]" } }
 *
 * Stored together in Upstash. sendPushToAll() routes via the right
 * transport (web-push library or Expo Push HTTP gateway).
 *
 * DELETE removes by identifier — either the web endpoint URL or the
 * Expo token.
 */
export async function POST(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    subscription?:
      | { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
      | { type?: "expo"; expoToken?: string };
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sub = body.subscription;
  if (!sub) {
    return NextResponse.json(
      { error: "Missing subscription" },
      { status: 400 },
    );
  }

  const identity = await getStaffIdentity();
  const owner = identity?.kind === "employee" ? identity.name : undefined;

  // Expo native shape
  if ("type" in sub && sub.type === "expo") {
    if (!sub.expoToken) {
      return NextResponse.json(
        { error: "Missing expoToken" },
        { status: 400 },
      );
    }
    const result = await addSubscription(
      { kind: "expo", expoToken: sub.expoToken },
      owner,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, transport: "expo" });
  }

  // Web push shape
  if ("endpoint" in sub) {
    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return NextResponse.json(
        { error: "Missing web push subscription fields" },
        { status: 400 },
      );
    }
    const result = await addSubscription(
      {
        kind: "web",
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      },
      owner,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, transport: "web" });
  }

  return NextResponse.json(
    { error: "Unrecognized subscription shape" },
    { status: 400 },
  );
}

export async function DELETE(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { endpoint?: string; expoToken?: string };
  try {
    body = (await req.json()) as { endpoint?: string; expoToken?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const identifier = body.expoToken ?? body.endpoint;
  if (!identifier) {
    return NextResponse.json(
      { error: "Missing identifier (endpoint or expoToken)" },
      { status: 400 },
    );
  }
  await removeSubscription(identifier);
  return NextResponse.json({ ok: true });
}
