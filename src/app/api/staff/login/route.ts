import { NextResponse } from "next/server";
import crypto from "crypto";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { isAllowedEmail } from "@/lib/magic-link";

export const runtime = "nodejs";

const COOKIE_NAME = "mm-staff";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function timingSafeStrEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  // Slow down brute-force attempts
  const ip = clientIpFrom(req);
  const rl = rateLimit(`staff-login:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const expectedPassword = process.env.STAFF_PASSWORD;
  const token = process.env.STAFF_TOKEN;

  if (!expectedPassword || !token) {
    return NextResponse.json(
      {
        error:
          "Staff sign-in is not configured. STAFF_PASSWORD or STAFF_TOKEN env var is missing.",
      },
      { status: 500 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = (body.password ?? "").trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  // Both checks must pass — generic error message either way to prevent
  // attackers from enumerating valid emails.
  const emailOk = isAllowedEmail(email);
  const passwordOk = timingSafeStrEqual(password, expectedPassword);

  if (!emailOk || !passwordOk) {
    return NextResponse.json(
      { error: "Wrong email or password" },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
