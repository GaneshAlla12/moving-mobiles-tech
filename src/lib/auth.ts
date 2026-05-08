import { cookies } from "next/headers";
import { EMPLOYEES, type Employee } from "./schedule";

/**
 * Server-side check for whether the current request is from a logged-in
 * staff member. Compares the mm-staff cookie to STAFF_TOKEN env var.
 */
export async function isStaff(): Promise<boolean> {
  const expected = process.env.STAFF_TOKEN;
  if (!expected) return false;
  const store = await cookies();
  const cookie = store.get("mm-staff")?.value;
  return Boolean(cookie && cookie === expected);
}

/**
 * Returns the currently-identified employee (if any). Set by /staff/identify
 * after login. Used to auto-clock-in/out and personalize the staff portal.
 *
 * Returns "viewer" when the user logged in as a manager/view-only — has
 * staff access but doesn't get clocked in/out.
 */
export async function getStaffIdentity(): Promise<
  { kind: "employee"; name: Employee } | { kind: "viewer" } | null
> {
  if (!(await isStaff())) return null;
  const store = await cookies();
  const raw = store.get("mm-staff-name")?.value;
  if (!raw) return null;
  if (raw === "__viewer") return { kind: "viewer" };
  if (EMPLOYEES.includes(raw as Employee)) {
    return { kind: "employee", name: raw as Employee };
  }
  return null;
}
