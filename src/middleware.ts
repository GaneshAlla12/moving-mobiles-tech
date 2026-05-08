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

export function middleware(req: NextRequest) {
  const expected = process.env.STAFF_TOKEN;
  const cookie = req.cookies.get(STAFF_COOKIE)?.value;

  if (expected && cookie === expected) {
    return NextResponse.next();
  }

  // Customer hit a staff-only URL — silently send them to the homepage.
  // No login prompt is shown, so customers never know staff-only routes exist.
  // Employees access the login page directly at /staff.
  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
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
  ],
};
