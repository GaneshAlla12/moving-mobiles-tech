import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth";
import { listAllProducts } from "@/lib/shopify-storefront";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/staff/shopify-products
 *
 * Returns every product the Storefront API can see — i.e. exactly what
 * Maria has access to. Used by the staff "Catalog audit" page to spot
 * products that are in Shopify Admin but NOT visible via the Headless
 * channel (so Maria can't find them).
 */
export async function GET() {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await listAllProducts();
    return NextResponse.json({
      products: result.products,
      fetchedAt: result.fetchedAt,
      truncated: result.truncated,
      totalCount: result.products.length,
    });
  } catch (e) {
    console.error("[/api/staff/shopify-products] error", e);
    return NextResponse.json(
      {
        error: "Failed to load products",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
