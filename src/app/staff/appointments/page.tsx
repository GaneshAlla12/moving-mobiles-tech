import type { Metadata } from "next";
import { listBookings, isCalConfigured, type CalBooking } from "@/lib/cal-com";

export const metadata: Metadata = {
  title: "Staff appointments",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SHOP_TZ = process.env.CAL_COM_TIMEZONE ?? "America/New_York";

export default async function StaffAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const sp = await searchParams;
  const view = sp?.view === "past" ? "past" : "upcoming";

  const calOk = isCalConfigured();
  const now = new Date();
  const horizon = new Date();
  horizon.setDate(now.getDate() + (view === "upcoming" ? 60 : 0));
  const past = new Date();
  past.setDate(now.getDate() - 60);

  const bookings = calOk
    ? await listBookings(
        view === "upcoming"
          ? {
              afterStart: now.toISOString(),
              beforeStart: horizon.toISOString(),
              status: ["upcoming"],
              take: 100,
            }
          : {
              afterStart: past.toISOString(),
              beforeStart: now.toISOString(),
              status: ["past", "cancelled"],
              take: 100,
            },
      )
    : null;

  // Sort: upcoming asc, past desc
  const sorted = (bookings ?? []).slice().sort((a, b) => {
    const ta = new Date(a.start).getTime();
    const tb = new Date(b.start).getTime();
    return view === "upcoming" ? ta - tb : tb - ta;
  });

  // Group by local date (YYYY-MM-DD in shop TZ)
  const groups = groupByLocalDate(sorted, SHOP_TZ);

  const totalUpcoming = view === "upcoming" ? sorted.length : null;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--canvas-sunken)]">
      <header className="border-b border-[var(--hairline)] bg-[var(--canvas)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="eyebrow flex items-center gap-2">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
                Staff · Appointments
              </div>
              <h1 className="mt-3 h-display-md">Repair appointments</h1>
              <p className="mt-3 text-[15px] text-[var(--ink-muted-60)] leading-[1.55] max-w-2xl">
                Live from Cal.com. Click the meeting link on a card to open it
                in Cal.com (reschedule, cancel, mark no-show).
              </p>
            </div>

            {/* Tab switcher */}
            <div
              className="inline-flex rounded-full p-1"
              style={{
                background: "var(--canvas-elevated)",
                border: "1px solid var(--hairline)",
              }}
            >
              <Tab href="/staff/appointments?view=upcoming" active={view === "upcoming"}>
                Upcoming{totalUpcoming !== null && ` · ${totalUpcoming}`}
              </Tab>
              <Tab href="/staff/appointments?view=past" active={view === "past"}>
                Past
              </Tab>
            </div>
          </div>

          {!calOk && (
            <div
              className="mt-6 rounded-[14px] p-4 text-[14px] text-[var(--ink-muted-80)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,193,7,0.08), rgba(255,193,7,0.04))",
                border: "1px solid rgba(255, 193, 7, 0.25)",
              }}
            >
              Cal.com isn&apos;t configured — set{" "}
              <code className="rounded bg-[var(--canvas)] px-1 py-0.5 border border-[var(--hairline)]">
                CAL_COM_API_KEY
              </code>{" "}
              and{" "}
              <code className="rounded bg-[var(--canvas)] px-1 py-0.5 border border-[var(--hairline)]">
                CAL_COM_EVENT_TYPE_ID
              </code>
              .
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 space-y-8">
        {!calOk ? null : sorted.length === 0 ? (
          <EmptyState view={view} />
        ) : (
          groups.map(({ date, items }) => (
            <DayGroup key={date} date={date} items={items} tz={SHOP_TZ} />
          ))
        )}
      </div>
    </div>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-all"
      style={{
        background: active ? "var(--ink)" : "transparent",
        color: active ? "var(--on-dark)" : "var(--ink-muted-60)",
      }}
    >
      {children}
    </a>
  );
}

function EmptyState({ view }: { view: "upcoming" | "past" }) {
  return (
    <div
      className="rounded-[20px] p-12 text-center"
      style={{
        background: "var(--canvas)",
        border: "1px solid var(--hairline)",
        boxShadow: "var(--shadow-1)",
      }}
    >
      <div
        className="grid w-14 h-14 mx-auto place-items-center rounded-full"
        style={{ background: "var(--canvas-elevated)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted-60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <div className="mt-4 text-[15px] font-semibold text-[var(--ink)]">
        {view === "upcoming"
          ? "No upcoming appointments"
          : "No past appointments in the last 60 days"}
      </div>
      <p className="mt-1.5 text-[13px] text-[var(--ink-muted-60)]">
        New bookings from /book will show up here automatically.
      </p>
    </div>
  );
}

function DayGroup({
  date,
  items,
  tz,
}: {
  date: string;
  items: CalBooking[];
  tz: string;
}) {
  const label = formatDayHeader(date, tz);
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-[18px] font-semibold tracking-[-0.012em]">
          {label.weekday}
        </h2>
        <span className="text-[14px] text-[var(--ink-muted-60)] tabular-nums">
          {label.long}
        </span>
        <span
          className="ml-auto text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full"
          style={{
            background: "var(--canvas-elevated)",
            color: "var(--ink-muted-60)",
            border: "1px solid var(--hairline)",
          }}
        >
          {items.length} {items.length === 1 ? "booking" : "bookings"}
        </span>
      </div>
      <div className="grid gap-3">
        {items.map((b) => (
          <BookingCard key={b.uid} booking={b} tz={tz} />
        ))}
      </div>
    </section>
  );
}

function BookingCard({ booking, tz }: { booking: CalBooking; tz: string }) {
  const customer = booking.attendees[0];
  const start = formatTime12(booking.start, tz);
  const end = formatTime12(booking.end, tz);

  const m = booking.metadata ?? {};
  const device =
    m.customDevice ||
    [m.brand, m.model].filter(Boolean).join(" ") ||
    m.deviceType ||
    "Device";
  const issues = m.issues || "—";
  const reference = m.reference;
  const isCancelled = /cancel/i.test(booking.status);
  const isRescheduled = !!booking.rescheduledByEmail;

  return (
    <article
      className="rounded-[16px] overflow-hidden transition-all hover:shadow-md"
      style={{
        background: "var(--canvas)",
        border: "1px solid var(--hairline)",
        boxShadow: "var(--shadow-1)",
        opacity: isCancelled ? 0.55 : 1,
      }}
    >
      <div className="flex">
        {/* Time block */}
        <div
          className="px-5 py-4 flex flex-col justify-center min-w-[120px] text-center"
          style={{
            background: isCancelled
              ? "var(--canvas-elevated)"
              : "var(--primary-soft)",
            borderRight: "1px solid var(--hairline)",
          }}
        >
          <div
            className="text-[16px] font-semibold tabular-nums tracking-[-0.012em]"
            style={{
              color: isCancelled ? "var(--ink-muted-60)" : "var(--primary)",
            }}
          >
            {start}
          </div>
          <div className="text-[11px] text-[var(--ink-muted-48)] tabular-nums">
            → {end}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-5 py-4 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[15px] font-semibold text-[var(--ink)]">
                  {customer?.name ?? "Customer"}
                </span>
                {isCancelled && <StatusPill kind="cancelled" />}
                {isRescheduled && !isCancelled && (
                  <StatusPill kind="rescheduled" />
                )}
                {reference && (
                  <span className="text-[11px] text-[var(--ink-muted-48)] font-mono tabular-nums">
                    {reference}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 flex-wrap text-[13px] text-[var(--ink-muted-60)]">
                {customer?.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="hover:text-[var(--primary)]"
                  >
                    {customer.email}
                  </a>
                )}
              </div>
            </div>
            <a
              href={`https://app.cal.com/booking/${booking.uid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-[var(--ink-muted-60)] hover:text-[var(--primary)] transition-colors shrink-0 flex items-center gap-1"
            >
              Open in Cal.com
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          {/* Device + issues row */}
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2 text-[13px]">
            <Detail label="Device" value={device} />
            <Detail label="Issues" value={issues} />
          </div>

          {booking.cancellationReason && (
            <div className="mt-2 text-[12px] text-[var(--ink-muted-48)] italic">
              Cancelled: {booking.cancellationReason}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 min-w-0">
      <span className="text-[var(--ink-muted-48)] uppercase tracking-[0.14em] text-[10px] font-semibold pt-0.5 shrink-0">
        {label}
      </span>
      <span className="text-[var(--ink)] truncate">{value}</span>
    </div>
  );
}

function StatusPill({ kind }: { kind: "cancelled" | "rescheduled" }) {
  const palette =
    kind === "cancelled"
      ? { bg: "rgba(239, 68, 68, 0.10)", fg: "#b91c1c", dot: "#ef4444" }
      : { bg: "rgba(245, 158, 11, 0.10)", fg: "#b45309", dot: "#f59e0b" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
      style={{ background: palette.bg, color: palette.fg }}
    >
      <span
        className="inline-block w-1 h-1 rounded-full"
        style={{ background: palette.dot }}
      />
      {kind}
    </span>
  );
}

/** Group an array of bookings by their local date in `tz`. */
function groupByLocalDate(
  items: CalBooking[],
  tz: string,
): { date: string; items: CalBooking[] }[] {
  const map = new Map<string, CalBooking[]>();
  for (const b of items) {
    const key = formatYmdInTz(b.start, tz);
    const arr = map.get(key) ?? [];
    arr.push(b);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

function formatYmdInTz(utcIso: string, tz: string): string {
  const d = new Date(utcIso);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d); // "2026-05-08"
}

function formatTime12(utcIso: string, tz: string): string {
  const d = new Date(utcIso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function formatDayHeader(
  ymd: string,
  tz: string,
): { weekday: string; long: string } {
  const d = new Date(`${ymd}T12:00:00.000Z`);
  const today = formatYmdInTz(new Date().toISOString(), tz);
  const yesterday = (() => {
    const t = new Date();
    t.setDate(t.getDate() - 1);
    return formatYmdInTz(t.toISOString(), tz);
  })();
  const tomorrow = (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return formatYmdInTz(t.toISOString(), tz);
  })();

  const weekday =
    ymd === today
      ? "Today"
      : ymd === yesterday
        ? "Yesterday"
        : ymd === tomorrow
          ? "Tomorrow"
          : new Intl.DateTimeFormat("en-US", {
              timeZone: tz,
              weekday: "long",
            }).format(d);
  const long = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
  return { weekday, long };
}
