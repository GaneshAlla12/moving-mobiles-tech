"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function StaffLoginInner() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/repair-cost";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Sign-in failed");
      window.location.href = next;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-72px)] grid place-items-center px-5 py-16 relative overflow-hidden bg-[var(--canvas-sunken)]">
      {/* Decorative subtle radial */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--primary-soft) 0%, transparent 60%)",
        }}
      />

      <div
        className="relative w-full max-w-md rounded-[24px] p-8 sm:p-10"
        style={{
          background: "var(--canvas)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-3)",
        }}
      >
        <div className="eyebrow flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--primary)" }}
          />
          Staff access
        </div>
        <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.022em] leading-[1.05]">
          Sign in
        </h1>
        <p className="mt-3 text-[15px] text-[var(--ink-muted-60)] leading-[1.55]">
          Enter your work email and the staff password to access the repair
          cost tool and shop CMS.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
              placeholder="you@movingmobiles.com"
              className="mt-2 w-full rounded-[12px] px-4 py-3 text-[15px] bg-[var(--canvas)] border border-[var(--hairline-strong)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-soft)] transition-all"
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-2 w-full rounded-[12px] px-4 py-3 text-[15px] bg-[var(--canvas)] border border-[var(--hairline-strong)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-soft)] transition-all"
            />
          </Field>

          {error && (
            <div
              className="rounded-[10px] px-3 py-2 text-[13px] flex items-start gap-2"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                color: "#b91c1c",
                border: "1px solid rgba(239, 68, 68, 0.20)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`btn-primary w-full px-6 py-3 text-[15px] ${loading || !email || !password ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-7 text-[12px] text-[var(--ink-muted-48)] leading-[1.55] text-center">
          Only emails on the approved staff list with the correct password can
          sign in.
        </p>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)] font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={null}>
      <StaffLoginInner />
    </Suspense>
  );
}
