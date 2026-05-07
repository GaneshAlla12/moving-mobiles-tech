import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getShopConfig, saveShopConfig } from "@/lib/shop-config";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

async function requireStaff(): Promise<boolean> {
  const expected = process.env.STAFF_TOKEN;
  if (!expected) return false;
  const store = await cookies();
  return store.get("mm-staff")?.value === expected;
}

export async function GET() {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = await getShopConfig();
  return NextResponse.json({ config });
}

export async function PUT(req: Request) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ip = clientIpFrom(req);
  const rl = rateLimit(`shop-config:${ip}`, 30, 5 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many saves" }, { status: 429 });
  }
  let body: { collections?: unknown };
  try {
    body = (await req.json()) as { collections?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.collections)) {
    return NextResponse.json(
      { error: "collections must be an array" },
      { status: 400 },
    );
  }

  const result = await saveShopConfig({
    collections: body.collections as never,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "save failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
