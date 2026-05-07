import { cookies } from "next/headers";

/**
 * Server-side check for whether the current request is from a logged-in
 * staff member. Compares the mm-staff cookie to STAFF_TOKEN env var.
 *
 * Use in server components or layouts to conditionally render staff-only UI.
 */
export async function isStaff(): Promise<boolean> {
  const expected = process.env.STAFF_TOKEN;
  if (!expected) return false;
  const store = await cookies();
  const cookie = store.get("mm-staff")?.value;
  return Boolean(cookie && cookie === expected);
}
