import type { Metadata } from "next";
import { listLeads, type Lead } from "@/lib/sheets";
import LeadsList from "@/components/staff/LeadsList";

export const metadata: Metadata = {
  title: "Customer requests",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffLeadsPage() {
  let leads: Lead[] = [];
  let loadError: string | null = null;
  try {
    leads = await listLeads();
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  const newLeads = leads.filter((l) => l.status !== "Contacted");
  const contactedLeads = leads.filter((l) => l.status === "Contacted");
  const afterHoursCount = newLeads.filter((l) => l.isAfterHours).length;
  const missedCallbackCount = newLeads.filter((l) => l.isMissedCallback).length;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--canvas-sunken)]">
      {/* Hero header */}
      <header
        className="relative overflow-hidden border-b border-[var(--hairline)]"
        style={{ background: "var(--canvas)" }}
      >
        {/* Decorative radial */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, var(--primary-soft) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-14 pb-12">
          <div className="eyebrow flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            Staff · Customer requests
          </div>

          <h1
            className="mt-4 font-semibold leading-[1.05] tracking-[-0.022em]"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            Customer requests.
          </h1>

          <p className="mt-5 text-[17px] text-[var(--ink-muted-60)] leading-[1.55] max-w-2xl">
            Leads captured by Maria, the AI voice assistant. Each card shows
            what the customer asked about — call or email them back without
            making them repeat themselves.
          </p>

          {/* Summary stat cards */}
          <div
            className={`mt-10 grid gap-3 sm:gap-5 max-w-4xl ${
              missedCallbackCount > 0
                ? "grid-cols-2 sm:grid-cols-4"
                : "grid-cols-3"
            }`}
          >
            {missedCallbackCount > 0 && (
              <StatCard
                label="Urgent"
                value={missedCallbackCount}
                tone="urgent"
                hint="Missed transfers"
              />
            )}
            <StatCard
              label="New"
              value={newLeads.length}
              tone="primary"
              hint="Waiting for follow-up"
            />
            <StatCard
              label="After-hours"
              value={afterHoursCount}
              tone="warning"
              hint="Called when closed"
            />
            <StatCard
              label="Contacted"
              value={contactedLeads.length}
              tone="success"
              hint="Already followed up"
            />
          </div>

          {loadError && (
            <div
              className="mt-8 rounded-[16px] p-5 text-[14px] text-[var(--ink-muted-80)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(239,68,68,0.10), rgba(239,68,68,0.04))",
                border: "1px solid rgba(239, 68, 68, 0.28)",
              }}
            >
              <div className="font-semibold text-[#b91c1c] mb-1">
                Couldn&apos;t load leads from Google Sheets
              </div>
              <code className="rounded bg-[var(--canvas)] px-1.5 py-0.5 border border-[var(--hairline)] text-[12px]">
                {loadError}
              </code>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
        <LeadsList
          initialNewLeads={newLeads}
          initialContactedLeads={contactedLeads}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone: "primary" | "warning" | "success" | "urgent";
  hint: string;
}) {
  const toneStyles: Record<
    typeof tone,
    { dot: string; valueColor: string; border?: string; bg?: string; pulse?: boolean }
  > = {
    primary: { dot: "#0071e3", valueColor: "var(--ink)" },
    warning: { dot: "#f59e0b", valueColor: "var(--ink)" },
    success: { dot: "#22c55e", valueColor: "var(--ink)" },
    urgent: {
      dot: "#ef4444",
      valueColor: "#b91c1c",
      border: "1px solid rgba(239, 68, 68, 0.30)",
      bg: "linear-gradient(180deg, rgba(239,68,68,0.06), var(--canvas) 70%)",
      pulse: true,
    },
  };
  const t = toneStyles[tone];

  return (
    <div
      className="rounded-[18px] p-5 sm:p-6 transition-all hover:scale-[1.01]"
      style={{
        background: t.bg ?? "var(--canvas)",
        border: t.border ?? "1px solid var(--hairline)",
        boxShadow: "var(--shadow-1)",
      }}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted-60)] font-medium">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${t.pulse ? "animate-pulse" : ""}`}
          style={{
            background: t.dot,
            boxShadow: t.pulse ? `0 0 8px ${t.dot}` : undefined,
          }}
        />
        {label}
      </div>
      <div
        className="mt-3 font-semibold tabular-nums leading-none tracking-[-0.025em]"
        style={{
          fontSize: "clamp(36px, 5vw, 52px)",
          color: t.valueColor,
        }}
      >
        {value}
      </div>
      <div className="mt-2 text-[12px] text-[var(--ink-muted-48)]">{hint}</div>
    </div>
  );
}
