import type { Metadata } from "next";
import {
  getDayLog,
  isAttendanceConfigured,
  summarize,
  todayInShopTz,
} from "@/lib/attendance";
import AttendanceView from "@/components/staff/AttendanceView";

export const metadata: Metadata = {
  title: "Staff attendance",
  robots: { index: false, follow: false },
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function StaffAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const today = todayInShopTz();
  const date =
    sp?.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : today;

  const log = await getDayLog(date);
  const summaries = log ? summarize(log) : [];
  const storageOk = isAttendanceConfigured();
  const isToday = date === today;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--canvas-sunken)]">
      <header className="border-b border-[var(--hairline)] bg-[var(--canvas)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
          <div className="eyebrow flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            Staff · Attendance
          </div>
          <h1 className="mt-3 h-display-md">Time clock</h1>
          <p className="mt-3 text-[15px] text-[var(--ink-muted-60)] leading-[1.55] max-w-2xl">
            Tap an employee&apos;s card to clock in or out. Past days are
            read-only — use the date navigator to review history.
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
              Storage not configured — punches won&apos;t persist.
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <AttendanceView
          date={date}
          today={today}
          isToday={isToday}
          initialSummaries={summaries}
          initialPunches={log?.punches ?? []}
        />
      </div>
    </div>
  );
}
