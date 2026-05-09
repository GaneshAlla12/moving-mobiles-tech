"use client";

import { useEffect, useState } from "react";

/**
 * Push notifications opt-in toggle. Lives on /staff/attendance and
 * /staff/identify so employees can enable booking + clock alerts on
 * their device after installing the PWA.
 */

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(b64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buffer;
}

type Status =
  | "loading"
  | "unsupported"
  | "denied"
  | "subscribed"
  | "available";

export default function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setStatus(sub ? "subscribed" : "available");
      } catch {
        setStatus("available");
      }
    })();
  }, []);

  if (status === "unsupported" || !VAPID_PUBLIC) return null;

  const enable = async () => {
    setBusy(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "available");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      const res = await fetch("/api/staff/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) throw new Error("Server rejected subscription");
      setStatus("subscribed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to enable");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/staff/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("available");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to disable");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="rounded-[14px] p-4 flex items-center gap-3"
      style={{
        background: "var(--canvas)",
        border: "1px solid var(--hairline)",
        boxShadow: "var(--shadow-1)",
      }}
    >
      <div
        className="grid place-items-center w-10 h-10 rounded-full shrink-0"
        style={{
          background:
            status === "subscribed"
              ? "linear-gradient(135deg, #22c55e 0%, #15803d 100%)"
              : "var(--canvas-elevated)",
          color: status === "subscribed" ? "white" : "var(--ink-muted-60)",
          border:
            status === "subscribed" ? "none" : "1px solid var(--hairline)",
        }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-[var(--ink)]">
          {status === "subscribed"
            ? "Push notifications on"
            : "Push notifications"}
        </div>
        <div className="text-[12px] text-[var(--ink-muted-60)] mt-0.5">
          {status === "subscribed"
            ? "You'll get a ping when a new booking comes in."
            : status === "denied"
              ? "Blocked in browser settings — enable from your phone's site settings."
              : "Get a ping when new bookings arrive."}
        </div>
        {error && (
          <div className="text-[11px] text-[#b91c1c] mt-1">{error}</div>
        )}
      </div>
      {status === "subscribed" ? (
        <button
          onClick={disable}
          disabled={busy}
          className="rounded-full border border-[var(--hairline-strong)] px-3 py-1.5 text-[12px] hover:bg-[var(--canvas-elevated)] transition-colors"
        >
          {busy ? "…" : "Turn off"}
        </button>
      ) : status === "available" ? (
        <button
          onClick={enable}
          disabled={busy}
          className="btn-primary px-4 py-1.5 text-[12px]"
        >
          {busy ? "…" : "Enable"}
        </button>
      ) : null}
    </div>
  );
}
