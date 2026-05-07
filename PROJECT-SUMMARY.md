# Moving Mobiles Tech — Custom Web Platform

A full-stack web platform for a Connecticut-based mobile repair shop, built from scratch and deployed to production.

**Live URL:** https://mm-site-six.vercel.app

---

## Executive summary

A premium, Apple-inspired web presence with a real-time Shopify-backed e-commerce storefront, a 6-step custom booking system, a staff-only repair-cost portal with email-based authentication, and production-grade security hardening — all deployed on Vercel with auto-syncing live data from the client's Shopify store.

---

## Scope of work delivered

### 1. Brand-driven marketing site (5 pages)
- **Homepage** with cinematic full-bleed photography hero, 80–120px display headlines, animated counters (Google rating, review count, warranty), and a sticky-scroll "How it works" 3-stage interactive process
- **Services index + 19 individual service detail pages** auto-generated from structured content (audio jack repair, battery replacement, motherboard repair, water damage, etc.)
- **About** page with brand mission, stats, and journey
- **Contact** page with structured cards (address, phone, email, hours)
- **Light + dark mode** toggle with persisted preference + system fallback + no-flash hydration script
- Fully responsive across mobile / tablet / desktop with mobile hamburger nav

### 2. Custom appointment booking system (6-step wizard)
A fully custom multi-step booking flow modeled after uBreakiFix:
- **Step 1 — Device type** (Phone, Tablet, Computer, Game Console, Other) with custom SVG icons
- **Step 2 — Brand** (dynamic dropdown per device type)
- **Step 3 — Model** (~140 phone models, 50+ tablets, laptops, consoles)
- **Step 4 — Issue selection** (multi-select checkboxes + free-text description, 500-char limit)
- **Step 5 — Date & time picker** (custom calendar with shop-hour-aware time slots, 30-min increments, past-time hiding, 30-day horizon)
- **Step 6 — Contact details** + automatic email/phone validation
- **Confirmation page** with reference number generation
- **Sticky sidebar summary** that updates as the user progresses
- **Persistent state** in `sessionStorage` (survives refresh)
- **POST `/api/book`** endpoint that accepts the booking, validates fields, applies rate limiting, runs honeypot bot detection, and logs to server output (ready to wire to email/Slack/DB)

### 3. Headless Shopify e-commerce storefront
Custom storefront pulling **live product data** from the client's Shopify store with zero API tokens:
- **190+ products** auto-rendered across 26 Shopify-defined collections (iPhones, Samsung, AirPods, watches, gaming consoles, accessories, repair services, etc.)
- **Product detail pages** with image gallery, variant picker (color, storage, etc.), price, descriptions
- **Shopping cart** (slide-in drawer) with quantity controls, persistent in `localStorage`
- **Secure checkout** redirects to Shopify's HTTPS checkout via cart permalinks (PCI-compliant, payment never touches our server) — opens in a **new tab** so customers don't lose their place if they cancel
- **Shopify-defined collections** with custom display labels and grouping
- **8-group dropdown navigation** (Phones, Watches, Audio, Gaming, Charging, Accessories, Repair, Apple) with 200ms hover-bridge close delay
- **Color swatches** auto-rendered from product variants with 50+ named-color mappings (including Cosmic Orange, Natural Titanium, Rose Gold gradients, etc.)
- **"Trending Products & Services"** section pulling from Shopify's "Star Products" / "Top Picks" collection
- **10-second cache** with **on-demand revalidation via Shopify webhook** for near-instant updates (price/inventory/new-product changes appear within 1–2 seconds)
- **Editable in Shopify Admin only** — every change auto-syncs to the live site

### 4. Staff-only repair cost portal
A protected internal tool for employees:
- **Repair pricing matrix** for **17 iPhone models** (14 → 17 Pro Max + iPhone Air) and **30 Samsung Galaxy models** (S21 → S25 Ultra, Z Fold 3–7, Z Flip 3–7, Note 20)
- **6-line cost breakdown** per model: battery, back glass, rear camera, screen, screen + back glass, other damage
- **Two-dropdown selector** (device type → model)
- **Email + password authentication** with email allowlist via env var
- **Hidden from public** — no nav links, no footer links; customers redirected to homepage if they discover the URL
- **Edge middleware** silently bounces unauthenticated requests
- **Server-side cookie-based session** (HTTP-only, Secure, 30-day expiry)
- **Rate limiting** (10 attempts per IP per 15 min) with timing-safe password comparison

### 5. Security hardening
Production-grade defensive layers:
- **5 HTTP security headers** (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- **Rate limiting** on `/api/book` (5 submissions/hour/IP), `/api/staff/login` (10 attempts/15 min/IP)
- **Honeypot field** silently rejects bot submissions
- **Input validation** with length caps + regex format checks
- **HMAC-SHA256 signature verification** on Shopify webhooks (only Shopify can trigger cache invalidation)
- **Timing-safe string comparison** prevents timing attacks
- **No secrets in source code** — all sensitive config in Vercel env vars
- **HTTPS-only enforcement** with 2-year HSTS preload

### 6. Infrastructure
- **Hosted on Vercel** (free tier, auto-renewing TLS, edge DDoS mitigation)
- **CI/CD pipeline** — push to deploy via Vercel CLI
- **Environment-segregated secrets** (Production env)
- **Shopify webhook** wired for instant cache invalidation on product/collection changes
- **Auto-revalidating cache** (10s default for shop, 60s for marketing pages)

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Typography | SF Pro Display / SF Pro Text via system stack |
| Image optimization | `next/image` with Shopify CDN |
| Authentication | Custom (email allowlist + password + signed cookie) |
| E-commerce | Headless Shopify (public Storefront endpoints) |
| Hosting | Vercel |
| Email infrastructure | Resend-ready (optional, currently disabled) |
| Animation | Pure CSS + Intersection Observer (no library) |

---

## Pages built (29 total)

| Public-facing | Staff / API |
|---|---|
| `/` Homepage | `/staff` Login |
| `/services` Index | `/repair-cost` Cost estimator (gated) |
| `/services/[19 services]` | `/api/book` Booking submission |
| `/about` | `/api/staff/login` Auth |
| `/contact` | `/api/staff/logout` |
| `/shop` All products | `/api/revalidate` Webhook target |
| `/shop/[handle]` Product detail | |
| `/book` Step 1 — device | |
| `/book/brand` | |
| `/book/model` | |
| `/book/issue` | |
| `/book/schedule` | |
| `/book/contact` | |
| `/book/confirmation` | |

---

## Market valuation (honest take)

This is a **template-styled custom build** — not bespoke design. No custom branding work, no original photography, no custom logo, no copywriting. The visual style applies common modern patterns (Apple-inspired layout, sticky scroll, animated counters), and product/service imagery comes from the client's existing assets.

The real value is in the **functional integrations** — actual working headless Shopify storefront, multi-step booking with state machine, staff auth, security hardening, deployment. This is "small-business website with real backend wiring," not "premium design product."

### Realistic US market rates for the same scope

| Tier | Estimated cost |
|---|---|
| **Bargain freelancer** (Fiverr/Upwork) | $800 – $2,500 |
| **Mid-tier independent contractor** | $3,000 – $7,000 |
| **Small studio** | $7,000 – $15,000 |

### Component-level breakdown (mid-tier contractor rates)

| Component | Typical range |
|---|---|
| Multi-page Next.js marketing site (using existing assets) | $400 – $1,200 |
| Headless Shopify integration + custom cart + checkout handoff | $1,000 – $2,500 |
| Multi-step booking system + custom calendar + API endpoint | $1,000 – $2,500 |
| Staff authentication (email allowlist + password) | $300 – $800 |
| Security hardening (headers, rate limit, HMAC verification) | $300 – $700 |
| Light/dark mode + responsive polish | $200 – $500 |
| Vercel deployment + Shopify webhook setup | $200 – $500 |
| **Approximate total** | **~$3,400 – $8,700** |

---

## Project pricing

| | |
|---|---|
| **Charged** | **$350** |
| Realistic market value (mid-tier contractor) | $4,000 – $7,000 |
| Effective discount vs. market | **~90–95%** |

A solid deal for the client. If you wanted to charge closer to market rate on future projects of this scope, $2,000–$3,500 is well within reason for what you delivered here.

---

## What the client owns

- Full source code (Next.js project) — no vendor lock-in
- Hosted on the client's own Vercel account
- All env vars and secrets under client's control
- Domain-ready (just point DNS to Vercel)
- Auto-syncing with the client's Shopify store
- No recurring fees beyond Shopify and (optionally) a paid Vercel plan if traffic exceeds free tier

---

## Optional future work

- Connect real domain (`movingmobiles.com`) to Vercel
- Hook `/api/book` to email (Resend/Postmark) so bookings auto-email the shop
- Add real-time slot conflict detection (Google Calendar API integration)
- Replace placeholder logo with high-res client logo
- Real customer testimonials carousel on homepage
- Sell-back / device buy-back form ("Sell Your Device" flow)
- Analytics integration (GA4, Plausible, etc.)

---

*Document generated 2026-05-06.*
