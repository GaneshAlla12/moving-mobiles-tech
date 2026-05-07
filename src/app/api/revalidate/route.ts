import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import crypto from "crypto";

/**
 * Shopify webhook endpoint — clears the Shopify cache the instant any
 * product or collection changes.
 *
 * Authorization (any one passes):
 *   1. Valid Shopify HMAC signature in X-Shopify-Hmac-Sha256 header
 *      (set SHOPIFY_WEBHOOK_SECRET in Vercel to enable)
 *   2. Matching ?secret=… query param against REVALIDATE_SECRET env var
 *      (simpler fallback for manual testing)
 *
 * Configure in Shopify Admin:
 *   Settings → Notifications → Webhooks → Create webhook
 *   Event:  Product/Collection update/create/delete
 *   Format: JSON
 *   URL:    https://mm-site-six.vercel.app/api/revalidate
 *
 * After saving, Shopify shows a "Webhook signing secret" — copy that into
 * Vercel as SHOPIFY_WEBHOOK_SECRET and every webhook will be verified.
 */

export const runtime = "nodejs";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

async function isAuthorized(req: Request, rawBody: string): Promise<boolean> {
  // 1. Shopify HMAC signature
  const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  if (shopifySecret && hmacHeader) {
    const computed = crypto
      .createHmac("sha256", shopifySecret)
      .update(rawBody, "utf8")
      .digest("base64");
    if (timingSafeEqual(computed, hmacHeader)) return true;
  }

  // 2. Query-param secret (manual / fallback)
  const expected = process.env.REVALIDATE_SECRET;
  if (expected) {
    const provided = new URL(req.url).searchParams.get("secret");
    if (provided && timingSafeEqual(provided, expected)) return true;
  } else if (!shopifySecret) {
    // No secrets configured at all → allow (first-time setup convenience)
    return true;
  }

  return false;
}

async function handle(req: Request) {
  const rawBody = req.method === "POST" ? await req.text() : "";

  if (!(await isAuthorized(req, rawBody))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    revalidateTag("shopify", "max");
    revalidatePath("/shop", "page");
    revalidatePath("/shop/[handle]", "page");
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "revalidate failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    revalidated: true,
    when: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  return handle(req);
}

// Allow GET for manual testing (e.g. paste the URL with ?secret=… in browser)
export async function GET(req: Request) {
  return handle(req);
}
