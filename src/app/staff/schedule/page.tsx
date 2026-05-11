import type { Metadata } from "next";
import {
  canEditSchedule,
  getWeeklySchedule,
  mondayOf,
  SCHEDULE_EDITORS,
  type WeeklySchedule,
} from "@/lib/schedule";
import { getStaffIdentity } from "@/lib/auth";
import ScheduleEditor from "@/components/staff/ScheduleEditor";
import { isShopConfigConfigured } from "@/lib/shop-config";

export const metadata: Metadata = {
  title: "Staff schedule",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function StaffSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const sp = await searchParams;
  const weekStart =
    sp?.week && /^\d{4}-\d{2}-\d{2}$/.test(sp.week)
      ? sp.week
      : mondayOf(new Date());

  const [schedule, identity] = await Promise.all([
    getWeeklySchedule(weekStart) as Promise<WeeklySchedule | null>,
    getStaffIdentity(),
  ]);
  const storageOk = isShopConfigConfigured();

  const me = identity?.kind === "employee" ? identity.name : null;
  const canEdit = canEditSchedule(me);
  const editorsLabel = SCHEDULE_EDITORS.join(" and ");

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--canvas-sunken)]">
      <header className="border-b border-[var(--hairline)] bg-[var(--canvas)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
          <div className="eyebrow flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            Staff · Schedule
          </div>
          <h1 className="mt-3 h-display-md">Weekly staff schedule</h1>
          <p className="mt-3 text-[15px] text-[var(--ink-muted-60)] leading-[1.55] max-w-2xl">
            {canEdit
              ? "Build the week. Click a cell to add or change a 5-hour shift. Use the arrows to move between weeks."
              : `View the schedule for any week. Only ${editorsLabel} can edit shifts.`}
          </p>

          {!canEdit && (
            <div
              className="mt-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
              style={{
                background: "var(--canvas-elevated)",
                color: "var(--ink-muted-60)",
                border: "1px solid var(--hairline)",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              View only · only {editorsLabel} can edit
            </div>
          )}

          {!storageOk && (
            <div
              className="mt-6 rounded-[14px] p-4 text-[14px] text-[var(--ink-muted-80)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,193,7,0.08), rgba(255,193,7,0.04))",
                border: "1px solid rgba(255, 193, 7, 0.25)",
              }}
            >
              Storage not configured — changes will preview only.
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <ScheduleEditor
          weekStart={weekStart}
          initialShifts={schedule?.shifts ?? []}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
