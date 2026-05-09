"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Registers the service worker on staff routes only and surfaces the
 * install prompt UI when the browser supports it.
 *
 * Mounted in the root layout but no-ops on customer pages so the
 * customer site stays a normal website (no install prompt).
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWAManager() {
  const pathname = usePathname() ?? "/";
  const isStaffRoute =
    pathname.startsWith("/staff") || pathname.startsWith("/repair-cost");
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Register the service worker
  useEffect(() => {
    if (!isStaffRoute) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/staff/" })
      .catch((e) => console.error("[pwa] SW register failed:", e));
  }, [isStaffRoute]);

  // Detect if we're already installed (running in standalone display mode)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsStandalone(
      mq.matches ||
        // iOS Safari uses navigator.standalone instead
        (typeof navigator !== "undefined" &&
          (navigator as Navigator & { standalone?: boolean }).standalone ===
            true),
    );
    const onChange = () => setIsStandalone(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Capture the install prompt event for later
  useEffect(() => {
    if (!isStaffRoute) return;
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [isStaffRoute]);

  // Detect iOS Safari (where beforeinstallprompt isn't supported and we
  // have to show manual instructions instead)
  useEffect(() => {
    if (!isStaffRoute) return;
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari =
      /^((?!chrome|android).)*safari/i.test(ua) || /CriOS|FxiOS/i.test(ua);
    if (isIOS && isSafari) setShowIosHint(true);
  }, [isStaffRoute]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("mm-install-dismissed") === "1") {
        setDismissed(true);
      }
    } catch {}
  }, []);

  // Don't show on customer pages, when already installed, or when dismissed
  if (!isStaffRoute || isStandalone || dismissed) return null;

  // Only show on identify or login so it doesn't nag mid-task
  if (pathname !== "/staff/identify" && pathname !== "/staff") return null;

  // Detect Android-ish browser (PWA-installable). If neither beforeinstallprompt
  // nor iOS hint applies, still show the card — just with manual instructions —
  // because Chrome's auto-prompt is unreliable on first visit.
  const isAndroidish =
    typeof navigator !== "undefined" &&
    /android/i.test(navigator.userAgent) &&
    !showIosHint;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("mm-install-dismissed", "1");
    } catch {}
  };

  const onInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallEvent(null);
    }
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100vw-32px)] rounded-[16px] p-4 flex items-start gap-3"
      style={{
        background: "var(--canvas)",
        border: "1px solid var(--hairline-strong)",
        boxShadow: "var(--shadow-3)",
      }}
      role="dialog"
      aria-label="Install MM Staff app"
    >
      <div
        className="grid place-items-center w-9 h-9 rounded-full shrink-0 text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-focus) 100%)",
        }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-[var(--ink)]">
          Install MM Staff
        </div>
        {installEvent ? (
          <p className="mt-0.5 text-[12px] text-[var(--ink-muted-60)] leading-[1.45]">
            One-tap clock-in from your home screen. Works offline.
          </p>
        ) : showIosHint ? (
          <p className="mt-0.5 text-[12px] text-[var(--ink-muted-60)] leading-[1.45]">
            Tap the <strong>Share</strong> button at the bottom of Safari, then{" "}
            <strong>Add to Home Screen</strong>.
          </p>
        ) : isAndroidish ? (
          <p className="mt-0.5 text-[12px] text-[var(--ink-muted-60)] leading-[1.45]">
            Open Chrome&apos;s <strong>⋮ menu</strong> and tap{" "}
            <strong>Install app</strong>.
          </p>
        ) : (
          <p className="mt-0.5 text-[12px] text-[var(--ink-muted-60)] leading-[1.45]">
            Click the install icon in your browser&apos;s address bar.
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          {installEvent && (
            <button
              onClick={onInstall}
              className="btn-primary px-4 py-1.5 text-[12px]"
            >
              Install
            </button>
          )}
          <button
            onClick={dismiss}
            className="text-[12px] text-[var(--ink-muted-60)] hover:text-[var(--ink)] transition-colors px-2 py-1.5"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
