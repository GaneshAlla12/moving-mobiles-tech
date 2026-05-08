import type { Metadata } from "next";
import {
  getWeeklySchedule,
  mondayOf,
  type WeeklySchedule,
} from "@/lib/schedule";
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
  const weekStart = sp?.week && /^\d{4}-\d{2}-\d{2}$/.test(sp.week)
    ? sp.week
    : mondayOf(new Date());

  const schedule: WeeklySchedule | null = await getWeeklySchedule(weekStart);
  const storageOk = isShopConfigConfigured();

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
            Build the week. Click a cell to add or change a 5-hour shift.
            Use the arrows to move between weeks.
          </p>
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
        />
      </div>
    </div>
  );
}
