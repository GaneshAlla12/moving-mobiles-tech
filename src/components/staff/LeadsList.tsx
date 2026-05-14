"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Lead, LeadRequestEntry } from "@/lib/sheets";

type Toast = {
  id: number;
  rowIndex: number;
  name: string;
  phone: string;
};

export default function LeadsList({
  initialNewLeads,
  initialContactedLeads,
}: {
  initialNewLeads: Lead[];
  initialContactedLeads: Lead[];
}) {
  const [newLeads, setNewLeads] = useState<Lead[]>(initialNewLeads);
  const [contactedLeads, setContactedLeads] = useState<Lead[]>(
    initialContactedLeads,
  );
  const [pendingRow, setPendingRow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllContacted, setShowAllContacted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [, startTransition] = useTransition();

  // Track which missed-callback rowIndexes we've already shown a toast for,
  // so we only alert on NEWLY-arrived missed callbacks (not on every refresh).
  const seenMissedRef = useRef<Set<number>>(new Set());
  const toastIdRef = useRef(0);

  // Seed seenMissedRef with whatever was already missed on initial render —
  // we don't want to spam toasts the first time the page loads.
  useEffect(() => {
    for (const l of initialNewLeads) {
      if (l.isMissedCallback) seenMissedRef.current.add(l.rowIndex);
    }
  }, [initialNewLeads]);

  // Auto-refresh every 10s so new leads appear quickly when staff are
  // waiting on a transferred call.
  useEffect(() => {
    const id = setInterval(() => {
      refresh();
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  function pushToast(t: Omit<Toast, "id">) {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, ...t }]);
    // Auto-dismiss after 12s.
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 12_000);
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/staff/leads", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const all = (data.leads as Lead[]) ?? [];
      const newOnes = all.filter((l) => l.status !== "Contacted");

      // Detect missed callbacks we haven't toasted yet.
      const freshMissed = newOnes.filter(
        (l) => l.isMissedCallback && !seenMissedRef.current.has(l.rowIndex),
      );
      for (const m of freshMissed) {
        seenMissedRef.current.add(m.rowIndex);
        pushToast({
          rowIndex: m.rowIndex,
          name: m.customerName || "Caller",
          phone: m.phoneNumber,
        });
      }

      startTransition(() => {
        setNewLeads(newOnes);
        setContactedLeads(all.filter((l) => l.status === "Contacted"));
      });
    } finally {
      setRefreshing(false);
    }
  }

  async function toggleContacted(
    lead: Lead,
    action: "contacted" | "uncontacted",
  ) {
    setPendingRow(lead.rowIndex);
    setError(null);
    try {
      const res = await fetch("/api/staff/leads/mark-contacted", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rowIndexes: lead.rowIndexes, action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || data?.error || "Failed to update");
      }
      // Refresh to get the authoritative state (incl. contactedBy/contactedAt).
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPendingRow(null);
    }
  }

  const visibleContacted = showAllContacted
    ? contactedLeads
    : contactedLeads.slice(0, 5);
  const hiddenContacted = contactedLeads.length - visibleContacted.length;

  // Split new leads: missed callbacks bubble to the top in their own section.
  const urgentLeads = newLeads.filter((l) => l.isMissedCallback);
  const regularNewLeads = newLeads.filter((l) => !l.isMissedCallback);

  return (
    <div className="space-y-16">
      {/* Toast stack */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* Refresh chip */}
      <div className="flex items-center justify-end -mt-2">
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition-all hover:bg-[var(--canvas)]"
          style={{
            border: "1px solid var(--hairline)",
            background: "var(--canvas)",
          }}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${refreshing ? "animate-pulse" : ""}`}
            style={{ background: refreshing ? "#f59e0b" : "#22c55e" }}
          />
          {refreshing ? "Refreshing…" : "Auto-refreshing every 10s"}
        </button>
      </div>

      {error && (
        <div
          className="rounded-[14px] p-4 text-[14px]"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            color: "#b91c1c",
            border: "1px solid rgba(239, 68, 68, 0.25)",
          }}
        >
          {error}
        </div>
      )}

      {/* URGENT — missed callbacks (only renders when non-empty) */}
      {urgentLeads.length > 0 && (
        <section id="urgent">
          <UrgentBanner count={urgentLeads.length} />
          <ul className="mt-6 space-y-4">
            {urgentLeads.map((lead) => (
              <LeadCard
                key={`${lead.rowIndex}-${lead.timestamp}`}
                lead={lead}
                contacted={false}
                urgent
                pending={pendingRow === lead.rowIndex}
                onToggle={(action) => toggleContacted(lead, action)}
              />
            ))}
          </ul>
        </section>
      )}

      {/* NEW section */}
      <section>
        <SectionHeading
          eyebrow="Inbox"
          title="New requests"
          count={regularNewLeads.length}
        />

        {regularNewLeads.length === 0 ? (
          <EmptyState
            title={
              urgentLeads.length > 0
                ? "No other new requests."
                : "You're all caught up."
            }
            body="When Maria captures a new lead, it'll appear here automatically."
          />
        ) : (
          <ul className="mt-8 space-y-4">
            {regularNewLeads.map((lead) => (
              <LeadCard
                key={`${lead.rowIndex}-${lead.timestamp}`}
                lead={lead}
                contacted={false}
                pending={pendingRow === lead.rowIndex}
                onToggle={(action) => toggleContacted(lead, action)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* CONTACTED section */}
      <section>
        <SectionHeading
          eyebrow="Archive"
          title="Recently contacted"
          count={contactedLeads.length}
          muted
        />

        {contactedLeads.length === 0 ? (
          <EmptyState
            title="No contacted leads yet."
            body="Marked-contacted requests will show up here for your records."
            muted
          />
        ) : (
          <>
            <ul className="mt-8 space-y-4">
              {visibleContacted.map((lead) => (
                <LeadCard
                  key={`${lead.rowIndex}-${lead.timestamp}`}
                  lead={lead}
                  contacted
                  pending={pendingRow === lead.rowIndex}
                  onToggle={(action) => toggleContacted(lead, action)}
                />
              ))}
            </ul>
            {hiddenContacted > 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAllContacted(true)}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all hover:bg-[var(--canvas)]"
                  style={{
                    border: "1px solid var(--hairline-strong)",
                    color: "var(--ink-muted-80)",
                  }}
                >
                  Show {hiddenContacted} more contacted{" "}
                  {hiddenContacted === 1 ? "request" : "requests"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  count,
  muted = false,
}: {
  eyebrow: string;
  title: string;
  count: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap pb-3 border-b border-[var(--hairline)]">
      <div>
        <div
          className="text-[11px] uppercase tracking-[0.18em] font-medium"
          style={{
            color: muted ? "var(--ink-muted-48)" : "var(--primary)",
          }}
        >
          {eyebrow}
        </div>
        <h2
          className="mt-2 font-semibold tracking-[-0.018em]"
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            color: muted ? "var(--ink-muted-80)" : "var(--ink)",
          }}
        >
          {title}
        </h2>
      </div>
      <div
        className="text-[14px] tabular-nums font-medium"
        style={{ color: muted ? "var(--ink-muted-48)" : "var(--ink-muted-60)" }}
      >
        {count} {count === 1 ? "request" : "requests"}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  muted = false,
}: {
  title: string;
  body: string;
  muted?: boolean;
}) {
  return (
    <div
      className="mt-8 rounded-[24px] p-14 text-center"
      style={{
        background: "var(--canvas)",
        border: "1px dashed var(--hairline-strong)",
        opacity: muted ? 0.85 : 1,
      }}
    >
      <div
        className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{
          background: muted ? "var(--canvas-elevated)" : "var(--primary-soft)",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={muted ? "var(--ink-muted-48)" : "var(--primary)"}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="text-[19px] font-semibold tracking-[-0.011em]">
        {title}
      </div>
      <p className="mt-3 text-[14px] text-[var(--ink-muted-60)] max-w-md mx-auto leading-[1.6]">
        {body}
      </p>
    </div>
  );
}

function LeadCard({
  lead,
  contacted,
  pending,
  urgent = false,
  onToggle,
}: {
  lead: Lead;
  contacted: boolean;
  pending: boolean;
  urgent?: boolean;
  onToggle: (action: "contacted" | "uncontacted") => void;
}) {
  const requestText = lead.isAfterHours
    ? lead.customerRequest.replace(/^AFTER-HOURS CALL -\s*/, "")
    : lead.customerRequest;

  // Premium card styling: subtle gradient, refined border, more breathing room.
  const cardBackground = contacted
    ? "var(--canvas-elevated)"
    : urgent
      ? "linear-gradient(180deg, rgba(239, 68, 68, 0.06), var(--canvas) 60%)"
      : lead.isAfterHours
        ? "linear-gradient(180deg, rgba(245, 158, 11, 0.045), var(--canvas) 65%)"
        : "var(--canvas)";

  const cardBorder = urgent && !contacted
    ? "1.5px solid rgba(239, 68, 68, 0.45)"
    : lead.isAfterHours && !contacted
      ? "1px solid rgba(245, 158, 11, 0.32)"
      : "1px solid var(--hairline)";

  const cardShadow = urgent && !contacted
    ? "0 0 0 4px rgba(239, 68, 68, 0.08), var(--shadow-2)"
    : contacted
      ? "none"
      : "var(--shadow-1)";

  return (
    <li
      className="group rounded-[22px] p-7 sm:p-8 transition-all"
      style={{
        background: cardBackground,
        border: cardBorder,
        boxShadow: cardShadow,
        opacity: contacted ? 0.92 : 1,
      }}
    >
      {/* Top row: customer + badges */}
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
            {urgent && !contacted && (
              <Badge tone="urgent">Missed Call · Needs Callback</Badge>
            )}
            {!urgent && lead.isAfterHours && (
              <Badge tone="warning">After-hours</Badge>
            )}
            {!urgent && !contacted && !lead.isAfterHours && (
              <Badge tone="success">New</Badge>
            )}
            {contacted && <Badge tone="primary">Contacted</Badge>}
            <span className="text-[12.5px] text-[var(--ink-muted-48)] tabular-nums font-medium">
              {formatRelativeTime(lead.timestamp)}
            </span>
          </div>

          <div
            className="font-semibold tracking-[-0.018em] text-[var(--ink)]"
            style={{ fontSize: "clamp(22px, 2.4vw, 28px)" }}
          >
            {lead.customerName || "Anonymous caller"}
          </div>
        </div>
      </div>

      {/* Contact actions */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[14.5px]">
        {lead.phoneNumber && (
          <a
            href={`tel:${lead.phoneNumber.replace(/\D/g, "")}`}
            className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline tabular-nums font-medium transition-colors"
          >
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full"
              style={{ background: "var(--primary-soft)" }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.9a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            {lead.phoneNumber}
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline break-all font-medium transition-colors"
          >
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full"
              style={{ background: "var(--primary-soft)" }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="22 7 12 14 2 7" />
              </svg>
            </span>
            {lead.email}
          </a>
        )}
      </div>

      {/* The request — timeline if multiple entries, single block otherwise */}
      {lead.requests.length > 1 ? (
        <RequestTimeline
          requests={lead.requests}
          contacted={contacted}
          isAfterHours={lead.isAfterHours}
        />
      ) : (
        requestText && (
          <div
            className="mt-6 rounded-[16px] p-5 sm:p-6 relative"
            style={{
              background: contacted
                ? "var(--canvas)"
                : "var(--canvas-elevated)",
              border: "1px solid var(--hairline)",
            }}
          >
            <div className="text-[10.5px] uppercase tracking-[0.2em] text-[var(--ink-muted-48)] font-semibold mb-2.5">
              What they asked Maria
            </div>
            <p className="text-[15.5px] leading-[1.65] text-[var(--ink)]">
              {requestText}
            </p>
          </div>
        )
      )}

      {/* Footer: contacted meta + action */}
      <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
        {contacted && (lead.contactedAt || lead.contactedBy) ? (
          <div className="text-[12.5px] text-[var(--ink-muted-60)] leading-[1.5]">
            Contacted{" "}
            {lead.contactedBy && (
              <strong className="text-[var(--ink-muted-80)]">
                by {lead.contactedBy}
              </strong>
            )}{" "}
            {lead.contactedAt && (
              <span className="tabular-nums">
                · {formatRelativeTime(lead.contactedAt)}
              </span>
            )}
          </div>
        ) : (
          <span />
        )}

        {!contacted ? (
          urgent ? (
            // Urgent — "Call back now" button: opens tel: AND auto-marks contacted.
            <a
              href={
                lead.phoneNumber
                  ? `tel:${lead.phoneNumber.replace(/\D/g, "")}`
                  : undefined
              }
              onClick={() => {
                // Mark contacted as soon as they tap the button — they're
                // calling the customer back, so the urgent flag should go away.
                onToggle("contacted");
              }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "#ef4444",
                color: "#ffffff",
                boxShadow: "0 6px 18px rgba(239, 68, 68, 0.35)",
              }}
            >
              {pending ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.9a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Call back now
                </>
              )}
            </a>
          ) : (
            <button
              onClick={() => onToggle("contacted")}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-semibold transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "var(--primary)",
                color: "var(--on-primary)",
                boxShadow: "0 4px 14px rgba(0, 113, 227, 0.25)",
              }}
            >
              {pending ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Marking…
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Mark contacted
                </>
              )}
            </button>
          )
        ) : (
          <button
            onClick={() => onToggle("uncontacted")}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all disabled:opacity-50 hover:bg-[var(--canvas-elevated)]"
            style={{
              color: "var(--ink-muted-60)",
              border: "1px solid var(--hairline)",
              background: "var(--canvas)",
            }}
          >
            {pending ? "Undoing…" : "↩ Move back to new"}
          </button>
        )}
      </div>
    </li>
  );
}

function RequestTimeline({
  requests,
  contacted,
  isAfterHours,
}: {
  requests: LeadRequestEntry[];
  contacted: boolean;
  isAfterHours: boolean;
}) {
  // Strip the after-hours prefix only on the first entry of an after-hours call
  // — keeping further prefixes (e.g. TRANSFER REQUESTED) intact helps staff see
  // how the call evolved.
  const cleaned = requests.map((r, i) => ({
    ...r,
    text:
      isAfterHours && i === 0
        ? r.text.replace(/^AFTER-HOURS CALL -\s*/, "")
        : r.text,
  }));

  return (
    <div
      className="mt-6 rounded-[16px] p-5 sm:p-6 relative"
      style={{
        background: contacted ? "var(--canvas)" : "var(--canvas-elevated)",
        border: "1px solid var(--hairline)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div className="text-[10.5px] uppercase tracking-[0.2em] text-[var(--ink-muted-48)] font-semibold">
          What they asked Maria
        </div>
        <div className="text-[11px] text-[var(--ink-muted-48)] tabular-nums">
          {cleaned.length} entries during this call
        </div>
      </div>

      <ol className="relative space-y-4">
        {/* Vertical timeline line */}
        <div
          className="absolute left-[5px] top-1.5 bottom-1.5 w-px"
          style={{ background: "var(--hairline-strong)" }}
          aria-hidden="true"
        />

        {cleaned.map((entry, i) => {
          // Detect tag prefixes so we can render them as little chips.
          const tagMatch = entry.text.match(
            /^(TRANSFER REQUESTED|BUYING|AFTER-HOURS CALL|TRANSFER FAILED)\s*-\s*/,
          );
          const tag = tagMatch?.[1] ?? null;
          const body = tagMatch
            ? entry.text.slice(tagMatch[0].length)
            : entry.text;

          return (
            <li key={`${i}-${entry.timestamp}`} className="relative pl-6">
              {/* Dot */}
              <div
                className="absolute left-0 top-2 w-[11px] h-[11px] rounded-full"
                style={{
                  background: "var(--canvas)",
                  border: `2px solid ${tag ? "var(--primary)" : "var(--ink-muted-32)"}`,
                }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {tag && (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em]"
                    style={{
                      background: "var(--primary-soft)",
                      color: "var(--primary)",
                    }}
                  >
                    {tag.replace(/_/g, " ")}
                  </span>
                )}
                <span className="text-[11px] text-[var(--ink-muted-48)] tabular-nums">
                  {formatRelativeTime(entry.timestamp)}
                </span>
              </div>
              <p className="text-[14.5px] leading-[1.6] text-[var(--ink)]">
                {body}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "primary" | "success" | "warning" | "urgent";
  children: React.ReactNode;
}) {
  const styles: Record<
    typeof tone,
    { bg: string; fg: string; dot: string; pulse?: boolean }
  > = {
    primary: {
      bg: "var(--primary-soft)",
      fg: "var(--primary)",
      dot: "var(--primary)",
    },
    success: {
      bg: "rgba(34, 197, 94, 0.12)",
      fg: "#15803d",
      dot: "#22c55e",
    },
    warning: {
      bg: "rgba(245, 158, 11, 0.14)",
      fg: "#b45309",
      dot: "#f59e0b",
    },
    urgent: {
      bg: "rgba(239, 68, 68, 0.14)",
      fg: "#b91c1c",
      dot: "#ef4444",
      pulse: true,
    },
  };
  const t = styles[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
      style={{ background: t.bg, color: t.fg }}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${t.pulse ? "animate-pulse" : ""}`}
        style={{
          background: t.dot,
          boxShadow: t.pulse ? `0 0 6px ${t.dot}` : undefined,
        }}
      />
      {children}
    </span>
  );
}

function UrgentBanner({ count }: { count: number }) {
  return (
    <div
      className="rounded-[18px] p-5 sm:p-6 flex items-center gap-4 flex-wrap"
      style={{
        background:
          "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.04))",
        border: "1.5px solid rgba(239, 68, 68, 0.32)",
        boxShadow: "0 0 0 4px rgba(239, 68, 68, 0.06)",
      }}
    >
      <div
        className="inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0"
        style={{ background: "#ef4444", boxShadow: "0 0 18px rgba(239,68,68,0.5)" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.69 11.9 19.79 19.79 0 0 1 1.62 3.23 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.58 9.11" />
          <line x1="22" y1="2" x2="14" y2="10" />
          <line x1="14" y1="2" x2="22" y2="10" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#b91c1c]">
          Urgent · Missed transfers
        </div>
        <div
          className="mt-1 font-semibold tracking-[-0.011em] text-[var(--ink)]"
          style={{ fontSize: "clamp(18px, 2vw, 22px)" }}
        >
          {count} {count === 1 ? "customer" : "customers"} weren&apos;t connected
          — call back now.
        </div>
        <div className="mt-1 text-[13px] text-[var(--ink-muted-60)]">
          Maria transferred their call, but the line didn&apos;t pick up. Tap
          &ldquo;Call back now&rdquo; on any card below to dial — it&apos;ll
          mark the customer as contacted automatically.
        </div>
      </div>
    </div>
  );
}

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed top-20 right-5 sm:right-8 z-50 flex flex-col gap-3 pointer-events-none"
      style={{ maxWidth: "min(380px, calc(100vw - 40px))" }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-[16px] p-4 flex items-start gap-3 toast-slide-in"
          style={{
            background:
              "linear-gradient(135deg, rgba(239,68,68,0.97), rgba(220,38,38,0.97))",
            color: "#ffffff",
            boxShadow: "0 12px 36px rgba(239, 68, 68, 0.35)",
            backdropFilter: "saturate(180%) blur(10px)",
          }}
        >
          <div
            className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.9a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] uppercase tracking-[0.14em] font-semibold opacity-90">
              Missed callback
            </div>
            <div className="mt-0.5 text-[14.5px] font-semibold leading-tight">
              Call {t.name} back now
            </div>
            {t.phone && (
              <div className="mt-0.5 text-[12.5px] opacity-90 tabular-nums">
                {t.phone}
              </div>
            )}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="shrink-0 -mr-1 -mt-1 w-7 h-7 rounded-full inline-flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-slide-in { animation: toastSlideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  const now = Date.now();
  const diff = (now - date.getTime()) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m} min ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (diff < 7 * 86400) {
    const d = Math.floor(diff / 86400);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
