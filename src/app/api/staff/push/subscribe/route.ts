import { NextResponse } from "next/server";
import { isStaff, getStaffIdentity } from "@/lib/auth";
import { addSubscription, removeSubscription } from "@/lib/push";

export const runtime = "nodejs";

/**
 * POST /api/staff/push/subscribe — register a browser push subscription
 * DELETE                          — remove a subscription by endpoint
 */
export async function POST(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } } };
  try {
    body = (await req.json()) as { subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } } };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const sub = body.subscription;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json(
      { error: "Missing subscription fields" },
      { status: 400 },
    );
  }

  const identity = await getStaffIdentity();
  const owner =
    identity?.kind === "employee" ? identity.name : undefined;

  const result = await addSubscription(
    {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    } as Parameters<typeof addSubscription>[0],
    owner,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { endpoint?: string };
  try {
    body = (await req.json()) as { endpoint?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }
  await removeSubscription(body.endpoint);
  return NextResponse.json({ ok: true });
}
