import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import {
  getPricingOverrides,
  savePricingOverrides,
} from "@/lib/pricing-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const overrides = await getPricingOverrides();
  return NextResponse.json({ overrides });
}

export async function PUT(req: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { prices?: Record<string, number> };
  try {
    body = (await req.json()) as { prices?: Record<string, number> };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.prices || typeof body.prices !== "object") {
    return NextResponse.json({ error: "Missing prices" }, { status: 400 });
  }
  const result = await savePricingOverrides(body.prices);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
