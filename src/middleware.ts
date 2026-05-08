import { NextRequest, NextResponse } from "next/server";

/**
 * Staff-only gate.
 *
 * Routes listed in `matcher` below require a valid `mm-staff` cookie.
 * The cookie value must equal the STAFF_TOKEN env var. Customers without
 * the cookie are redirected to /staff (login page).
 *
 * To set up:
 *   1. In Vercel Dashboard → Settings → Environments → Production:
 *      - STAFF_PASSWORD  =  any password you choose (employees use this)
 *      - STAFF_TOKEN     =  any long random string (kept secret server-side)
 *   2. Redeploy.
 */

export const STAFF_COOKIE = "mm-staff";
export const STAFF_NAME_COOKIE = "mm-staff-name";

export function middleware(req: NextRequest) {
  const expected = process.env.STAFF_TOKEN;
  const cookie = req.cookies.get(STAFF_COOKIE)?.value;

  if (!expected || cookie !== expected) {
    // Not signed in at all — silently send to homepage so customers never
    // discover the staff-only URLs.
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Signed in but no identity yet → bounce to /staff/identify.
  const name = req.cookies.get(STAFF_NAME_COOKIE)?.value;
  if (!name && !req.nextUrl.pathname.startsWith("/staff/identify")) {
    const url = req.nextUrl.clone();
    url.pathname = "/staff/identify";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Protect /repair-cost and /staff/shop (staff-only CMS).
  // /staff (login page) and /api/staff/* (auth endpoints) are NOT in this
  // list — they need to be reachable without a cookie so staff can sign in.
  matcher: [
    "/repair-cost",
    "/repair-cost/:path*",
    "/staff/shop",
    "/staff/shop/:path*",
    "/staff/schedule",
    "/staff/schedule/:path*",
    "/staff/pricing",
    "/staff/pricing/:path*",
    "/staff/appointments",
    "/staff/appointments/:path*",
    "/staff/attendance",
    "/staff/attendance/:path*",
    "/staff/identify",
  ],
};
