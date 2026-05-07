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
      if (!res.ok) {
        throw new Error(data?.error || "Sign-in failed");
      }
      // Cookie is set via Set-Cookie header — full reload so the
      // server-rendered Header picks up the new staff state.
      window.location.href = next;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  };

  return (
    <section className="tile-light min-h-[calc(100vh-64px)] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-[18px] border border-[var(--hairline)] bg-[var(--canvas)] p-8">
        <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--primary)]">
          Staff access
        </div>
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.011em] leading-[1.1]">
          Sign in
        </h1>
        <p className="mt-3 text-[15px] text-[var(--ink-muted-80)] leading-[1.5]">
          Enter your work email and the staff password to access the repair
          cost tool.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
              placeholder="you@movingmobiles.com"
              className="mt-2 w-full rounded-[11px] border border-[var(--hairline)] bg-[var(--canvas)] px-4 py-3 text-[15px] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-soft)]"
            />
          </label>

          <label className="block">
            <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--ink-muted-48)]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-2 w-full rounded-[11px] border border-[var(--hairline)] bg-[var(--canvas)] px-4 py-3 text-[15px] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary-soft)]"
            />
          </label>

          {error && <p className="text-[14px] text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`btn-primary w-full px-6 py-3 text-[15px] ${loading || !email || !password ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-[12px] text-[var(--ink-muted-48)] leading-[1.5]">
          Only emails on the approved staff list with the correct password
          can sign in.
        </p>
      </div>
    </section>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={null}>
      <StaffLoginInner />
    </Suspense>
  );
}
