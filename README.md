# Moving Mobiles Tech

**A production AI voice receptionist, premium e-commerce storefront, and real-time staff operations platform — built end-to-end in three weeks using Claude Code, for a real US phone-repair business.**

🔗 **Live:** [movingmobiles.com](https://www.movingmobiles.com)
🤖 **Try the AI agent:** call **(203) 760-9223** — Maria will pick up
📦 **Stack:** Next.js 16 · TypeScript · Tailwind 4 · VAPI · OpenAI · Shopify Storefront API · Cal.com · Google Sheets · Upstash Redis · Vercel

---

## TL;DR

A solo developer (with a game-design background, not a traditional web-engineering one) used **Claude Code** to ship a production-grade web application that:

- Handles **real customer phone calls** in English and Spanish via an AI voice agent
- Looks up **live Shopify inventory** with sub-1-second response time
- Books **real appointments** into Cal.com during the call
- **Saves leads** into Google Sheets and surfaces them in a real-time staff dashboard
- Detects **missed calls** when a transfer fails and flags them as urgent callbacks
- Tracks **Google Ads conversions** end-to-end for paid-acquisition optimization
- Runs on Vercel + Upstash Redis at sub-1-second latency

This README is a complete case study: what was built, why those choices were made, what went wrong and how it was fixed, and what skills the work demonstrates.

---

## Table of contents

1. [The premise](#the-premise)
2. [What's in this repository](#whats-in-this-repository)
3. [The AI-assisted development approach](#the-ai-assisted-development-approach)
4. [System architecture](#system-architecture)
5. [Features in detail](#features-in-detail)
6. [Engineering challenges and how they were solved](#engineering-challenges-and-how-they-were-solved)
7. [Performance metrics](#performance-metrics)
8. [Tech stack](#tech-stack)
9. [Skills demonstrated](#skills-demonstrated)
10. [What this proves about AI-assisted development in 2026](#what-this-proves-about-ai-assisted-development-in-2026)

---

## The premise

Moving Mobiles Tech is a phone-repair and electronics retail business in Wilton, CT. They sell phones, accessories, and offer repair services. Like most small businesses, they had:

- A static website that didn't convert traffic into leads
- Manual phone handling — staff missing calls during repair work
- No live integration between online inventory and customer-facing surfaces
- A paused Google Ads campaign that wasn't tracking conversions properly
- A booking system disconnected from the rest of the business

The goal: **build a customer experience that competes with what Apple or Samsung's flagship stores offer**, on a small-business budget, in under a month, using AI-assisted development as the primary engineering force-multiplier.

The result is this repository — a production system in active use, taking real customer calls and processing real bookings.

---

## What's in this repository

This single Next.js application contains six distinct products that work together:

### 1. Premium customer-facing website
A multi-page storefront with hero animations, sticky-scroll process explainers, embedded maps, a store-hours card with live open/closed status, a multi-step booking flow, a repair-cost estimator, services catalogue, shop pages, a contact page with click-to-call/email tracking, dark-mode support with proper section rhythm, PWA installation, and Google Ads conversion tracking on every interaction.

### 2. Multi-step appointment booking flow
A guided booking wizard at `/book` that walks customers through device → brand → model → issue → schedule → contact details → confirmation, integrated with Cal.com to create real calendar events. State persists in `sessionStorage` so reloads don't break the flow.

### 3. Shopify-backed storefront
Live product catalog pulled from the merchant's Shopify store via the Storefront API. Categories, product detail pages, variant selection, cart drawer, and a checkout flow that hands off to Shopify-hosted checkout.

### 4. AI voice receptionist ("Maria")
A VAPI-based voice agent powered by OpenAI GPT-4o-mini, configured to handle the full inbound customer call lifecycle:

- Greets customers based on store hours (different greeting for after-hours)
- Speaks English and Spanish, auto-detecting language
- Searches live Shopify inventory by product or service name
- Reports live availability (in-stock/out-of-stock) per variant
- Books appointments by checking Cal.com slots and creating bookings
- Collects customer leads with double-confirmation on name/phone/email
- Transfers calls to staff with full context (saves lead before transfer)
- Detects missed transfers and flags them as urgent callbacks
- Handles out-of-scope questions gracefully (weather, jokes, competitors)
- Promotes walk-in discounts at the right moments
- Saves every interaction to Google Sheets for staff visibility

### 5. Real-time staff operations dashboard
A protected staff portal (`/staff/*`) with seven sub-modules:

- **Customer Requests** (`/staff/leads`) — Real-time inbox of leads Maria captured, with urgent missed-callback section, request timeline per customer, toast notifications, batch mark-as-contacted, and Google Sheets persistence
- **Catalog Audit** (`/staff/catalog`) — Live view of every Shopify product visible via the Headless channel, to spot products hidden from the AI agent
- **Appointments** (`/staff/appointments`) — Cal.com bookings rendered server-side with day grouping
- **Time Clock** (`/staff/attendance`) — Punch-in/out tracking per employee, stored in Upstash Redis
- **Schedule** (`/staff/schedule`) — Weekly shift management
- **Shop CMS** (`/staff/shop`) — Carousel and featured-product overrides
- **Pricing** (`/staff/pricing`) — Repair cost overrides for the public estimator

Auth uses cookie-based middleware with per-employee PINs and a manager view-only role.

### 6. Google Ads conversion tracking
Site-wide Google Tag with three conversion events wired up:
- **Appointment Booking** ($20 — fires on `/book/confirmation`)
- **Phone Call Click** ($10 — fires on any `tel:` link click)
- **Email Click** ($5 — fires on any `mailto:` link click)

All wired through Vercel env vars so conversion IDs are zero-code to update.

---

## The AI-assisted development approach

This is the **meta-story** of the project: a developer with no prior production Next.js experience built and shipped all of the above in three weeks by using Claude Code as a pair-programming partner. Every line of code in this repository was either written by Claude or written by a human and reviewed by Claude. Every architectural decision was discussed conversationally before being implemented.

### What Claude Code did

- Wrote the initial scaffolding and component library
- Designed the routing structure and data model
- Generated the TypeScript types, GraphQL queries, and API client code
- Wrote the voice agent's 4000-word system prompt across ~20 iterations
- Diagnosed and fixed LLM failure modes in the voice agent (default phrase leakage, tool-sequencing violations, TTS pronunciation issues)
- Refactored the architecture mid-project from an n8n middleware path to direct API endpoints to cut latency 5–10×
- Wrote this README

### What the human did

- Decided what to build (product judgement)
- Tested it with real customers (the merchant's clients)
- Reviewed every change before deployment
- Made the architectural calls (Redis vs Supabase, single repo vs split, etc.)
- Wrote the prompts and clarifications that drove Claude's output
- Managed the relationship with the business

### The development loop

```
Human (product brief) → Claude (questions to clarify) → Human (decisions)
        ↓
Claude (writes code, tests build, deploys)
        ↓
Human (tests in production) → Claude (debugs, fixes)
        ↓
[repeat until shipped]
```

Most features went from "I want X" to "X is live in production" in **30 minutes to 2 hours**. That velocity wasn't possible before agentic coding tools existed.

### What this signals about AI-assisted development

In 2026, the bottleneck on small-to-medium production software is no longer engineering capacity. It's **product judgment + iteration speed + comfort with ambiguity**. A non-traditional developer with strong systems thinking and a willingness to argue with an LLM can ship enterprise-grade features in days. This repository is an existence proof.

---

## System architecture

```
                         ┌──────────────────────────┐
                         │  movingmobiles.com       │
                         │  (Vercel · Next.js 16)   │
                         └──────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   Customer-facing            Staff portal               API endpoints
   pages (SSR/SSG)            (cookie-auth gated)        (Vercel Functions)
        │                           │                           │
        │                           │           ┌───────────────┼───────────────┐
        │                           │           │               │               │
        │                           │      /api/vapi/*   /api/staff/*    /api/book, /api/*
        │                           │           │               │               │
        │                           │           ▼               ▼               ▼
        │                    ┌──────────┐  ┌────────┐    ┌──────────┐    ┌──────────┐
        │                    │ Auth/PIN │  │  VAPI  │    │  Google  │    │  Cal.com │
        │                    │Middleware│  │ Maria  │    │  Sheets  │    │   API    │
        │                    └──────────┘  └────────┘    └──────────┘    └──────────┘
        │                                       │                              │
        │                                       │                              │
        ▼                                       ▼                              ▼
   ┌──────────┐                          ┌──────────┐                   ┌──────────┐
   │ Shopify  │ ◄────── caches ─────────│ Upstash  │                   │ Cal.com  │
   │Storefront│                          │  Redis   │                   │ Events   │
   │   API    │                          └──────────┘                   └──────────┘
   └──────────┘
```

### Key design decisions

**1. Single monorepo, not microservices.** This is a small-business tool. Splitting into services would have added 10× operational complexity for zero business benefit. The Next.js 16 App Router makes it trivial to mix server components, client components, API routes, and middleware in one deployment.

**2. Direct API endpoints instead of an AI Agent middleware (n8n).** The initial architecture had a no-code n8n workflow sitting between VAPI and the data sources, with an internal LLM-based AI Agent making routing decisions. That added 4–7 seconds of latency per voice agent tool call. Migrating to direct Vercel API routes + a structured prompt on Maria's side cut latency to under 1 second.

**3. Upstash Redis for caching, Google Sheets for persistence.** Redis is purpose-built for the cache use case (5-minute TTL on product lookups). Google Sheets is the merchant's existing system of record for leads — using it as the database means the merchant can edit/manage leads with no developer involvement. This is the kind of pragmatic call that wouldn't survive a code review at FAANG but is exactly right for a small business.

**4. Conversion-tracking config via NEXT_PUBLIC env vars.** Google Ads conversion IDs are configurable per environment (Production / Preview / Dev) and bundled into the client JS at build time. Zero code changes are needed to swap conversion IDs — just paste a new env var and redeploy.

**5. Staff portal uses cookie-based auth, not OAuth.** A 5-person business doesn't need OAuth. A shared password + per-employee PIN is faster, simpler, and good enough for the threat model.

---

## Features in detail

### Customer-facing site

| Feature | Implementation notes |
|---|---|
| **Premium homepage** | Hero with full-bleed background image and animated counter, sticky-scroll process section with 3 illustrated steps, repair grid with hover effects, embedded MapCard, final CTA |
| **Booking wizard** | 6-step React state machine using a custom BookingProvider context, with sessionStorage persistence so reloads don't break the flow |
| **Shop pages** | Live Shopify products via the Storefront API, with category filtering, individual product detail pages, variant selection, and cart drawer |
| **Repair cost estimator** | Public-facing calculator that pulls overrides from the staff Pricing CMS |
| **Service pages** | Statically generated at build time using `generateStaticParams`, one per service slug |
| **Contact page** | Asymmetric grid with embedded MapCard, click-to-call and click-to-email tracked as Google Ads conversions |
| **Footer** | Includes click-tracked "★ 4.9 · 81 Google reviews" link to the business's Google Maps listing |
| **Dark mode** | Three-tier tile colour palette (light/canvas/dark) with proper rhythm between sections; toggle persisted in localStorage; pre-hydration script applies theme before paint to avoid flash |
| **PWA** | Service worker with manifest, installable on iOS/Android |
| **SEO** | Per-page metadata, sitemap, robots.txt |

### AI voice agent (Maria)

The most technically interesting part of the project. Maria is configured in VAPI with:

- **Model:** OpenAI GPT-4o-mini (chosen for sub-1s response time; can be swapped to GPT-4o for higher quality at the cost of latency)
- **Voice:** Premium English/Spanish voice with a feminine "Apple Store associate" persona
- **System prompt:** ~4000 words of carefully tuned instructions across ~20 revisions
- **Tools (5 custom functions):**

| Tool | Endpoint | Purpose |
|---|---|---|
| `lookup_products` | `/api/vapi/lookup-products` | Search Shopify catalog by term. Cached 5min in Redis. Returns voice-friendly summary. |
| `save_customer_lead` | `/api/vapi/save-lead` | Append a lead row to Google Sheets with name/phone/email/request. |
| `check_availability` | `/api/vapi/check-availability` | Return open Cal.com slots for a date in voice-friendly format. |
| `book_appointment` | `/api/vapi/book-appointment` | Create a real Cal.com booking. Falls back to saving as a lead if booking fails. |
| `TransferCall` | VAPI built-in | Forward call to the store's number, after mandatory lead-save precondition. |

**Behavioural rules baked into the prompt:**

- **Two-stage lead capture**: distinguishes "soft intent" ("I want iPhone 17") from "hard commitment" ("I'll take the purple one") so the agent doesn't harvest contact info prematurely
- **Mandatory save-before-transfer**: enforced via prompt and tool description, prevents transferring callers to staff without context
- **Filler-phrase rotation matching action context**: "let me check that real quick" for lookups; "noting it down so my team gets your details" for saves
- **TTS-aware speech**: avoids phrases that TTS engines mispronounce ("in stock" → reads "inches"), spells letters with spaces not hyphens (hyphens read as "minus")
- **Number pronunciation**: "256 GB" → "two fifty-six gigabyte"; "1099" → "one thousand ninety-nine"
- **Double-confirmation** on name/phone/email before saving, with letter-by-letter spelling for unusual or word-like names
- **Out-of-scope redirect**: warmly redirects weather/jokes/competitor questions back to business topics
- **After-hours handling**: different greeting, aggressive lead capture, prefixes lead with "AFTER-HOURS CALL -"
- **Walk-in discount promotion**: mentions at most once per call, only during open hours, only for phone purchases (not repairs)

### Staff portal — Customer Requests (`/staff/leads`)

This is the most polished UI surface in the project. Key features:

- **Real-time auto-refresh** every 10 seconds; manual refresh button with pulsing indicator
- **Lead grouping**: rows with the same phone+email are grouped into one customer thread with a request timeline (Maria sometimes saves 2-3 times during one call; this collapses them visually)
- **Premium card design**: large customer name, clickable contact info with coloured icons, quote-style "What they asked Maria" block, badges (New, After-hours, Contacted, Urgent)
- **Urgent Callback section**: when VAPI's missed-transfer webhook fires, the lead jumps to the top with a red pulsing border, an alert banner, and a one-click "Call back now" button that opens `tel:` AND auto-marks as contacted in one tap
- **Toast notifications**: when a new missed callback arrives during an active session, a toast slides in from the top-right corner with the customer's name and phone
- **Batch mark-as-contacted**: clicking the button updates all grouped rows in the Google Sheet simultaneously via the Sheets `batchUpdate` API
- **Stats tiles**: at-a-glance counters for New / After-hours / Contacted / Urgent
- **Section headings**: distinct visual hierarchy between Inbox (new) and Archive (contacted)
- **Empty states**: encouraging messaging with appropriate iconography

### Staff portal — Catalog Audit (`/staff/catalog`)

Built to solve the question "is every Shopify product visible to Maria, or are some hidden from the Headless channel?"

- Live fetch from Storefront API, paginated up to 250 products
- Search + filter (All / Available / Out of stock)
- Per-variant availability with green/red dots and strikethrough for unavailable
- Tags rendered as chips
- Premium card layout matching the rest of the portal

### Backend API endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/vapi/lookup-products` | POST | Maria's product search; cached via Redis |
| `/api/vapi/save-lead` | POST | Maria's lead-save tool; appends to Sheets |
| `/api/vapi/check-availability` | POST | Returns open Cal.com slots for a date |
| `/api/vapi/book-appointment` | POST | Creates a Cal.com booking + writes a "BOOKED -" lead row |
| `/api/vapi/events` | POST | VAPI server-message webhook; detects missed transfers and flags leads as "Missed" in Sheets |
| `/api/staff/leads` | GET | Fetches all leads (grouped) for the staff dashboard |
| `/api/staff/leads/mark-contacted` | POST | Batch-updates lead status to Contacted across grouped rows |
| `/api/staff/shopify-products` | GET | Returns all products visible to the Headless channel for the catalog audit |
| `/api/staff/appointments` | GET | Reads Cal.com bookings for the staff appointments page |
| `/api/staff/attendance` | GET/POST | Time clock punches stored in Upstash Redis |
| `/api/staff/identify` | POST | Sets the staff identity cookie after PIN entry |
| `/api/staff/login` | POST | Sets the master staff cookie |
| `/api/staff/logout` | POST | Clears auth cookies |
| `/api/staff/pricing` | GET/POST | Pricing override CRUD |
| `/api/staff/push/subscribe` | POST | Push notification subscription |
| `/api/staff/schedule` | GET/POST | Schedule CRUD |
| `/api/staff/shop-config` | GET/POST | Shop CMS CRUD |
| `/api/availability` | GET | Public booking availability check |
| `/api/book` | POST | Public booking submission |
| `/api/revalidate` | POST | Cache invalidation hook |

---

## Engineering challenges and how they were solved

This section is the most resume-worthy part of the project. Every one of these is a story to walk a hiring manager through.

### Challenge 1: Voice agent response latency was unacceptable (4–7s per tool call)

**Symptom:** Customers calling Maria experienced multi-second silences after every question. The voice agent felt slow and broken.

**Diagnosis:** Profiled the request path:
```
VAPI → askAssistant webhook → n8n → internal LLM agent (1-2s) → Shopify API (1s) → format response (500ms) → return
```
Two LLM calls per customer turn (Maria + n8n's routing agent) + a slow Shopify Storefront query + middleware hops added up.

**Solution:**
1. Replaced the n8n middleware with direct Next.js API endpoints on Vercel
2. Split the single `askAssistant` tool into purpose-specific tools (`lookup_products`, `save_customer_lead`, etc.) — VAPI's LLM now picks the right tool directly, no internal routing agent needed
3. Added Upstash Redis caching with 5-minute TTL on product searches
4. Restructured the prompt to use structured tool parameters instead of free-text parsing

**Result:** End-to-end response time dropped from 4–7s to **0.5–1.5s**. Cached lookups are sub-100ms.

### Challenge 2: Maria kept ignoring the "save lead before transfer" rule

**Symptom:** When customers asked Maria to transfer them to a sales rep, she'd transfer immediately without first saving the lead — leaving the staff with zero context when they picked up.

**Diagnosis:** The system prompt had the rule, but it was buried 50% of the way down. Under conversational pressure, GPT-4o-mini was falling back to its training default ("transfer when asked"), ignoring the rule.

**Solution:** Multi-layer defense.
1. Moved the rule to the very top of the prompt under a 🚨 banner labeled "MOST IMPORTANT RULE"
2. Restructured it as an explicit numbered sequence (Step 1 → 7)
3. Added the precondition into the **tool description** of `TransferCall` itself — "CRITICAL PRECONDITION: askAssistant Mode B save MUST have been called in the previous turn"
4. Added explicit instruction that even when the customer refuses to give details, the agent must STILL save a lead with `"blank"` for unknown fields plus a clear `customerRequest` summary
5. Added the rule again in the IMPORTANT RULES section near the bottom for reinforcement

**Result:** Maria now reliably saves a lead before every transfer. Verified across dozens of real test calls.

### Challenge 3: TTS engine misreading text

**Symptom:** Maria saying things like *"iPhone 15 inches stock"* (TTS misread "in stock"), *"M-A-R-K minus 1 minus 2 minus 3 at gmail"* (TTS misread hyphens as "minus"), *"two five six gigabyte"* (TTS split "256" into separate digits).

**Solution:** Voice-specific prompt engineering. Added explicit anti-pattern rules:
- Never use the phrase "in stock" — use "available" instead
- When spelling letters back, use spaces or commas between them, never hyphens
- Numbers must be spelled as whole words: "256" → "two fifty-six", "1099" → "one thousand ninety-nine"
- Storage sizes: "256GB" → "two fifty-six gigabyte"

This is the kind of detail that takes 15 minutes of testing to catch but transforms the voice UX. A standard "AI engineer" without voice-product instinct would never notice these.

### Challenge 4: Maria leaking default filler phrases

**Symptom:** Even after removing "let me check that real quick" from the prompt, Maria kept saying it before saving customer details (when the contextually-correct filler should have been "noting it down for the team").

**Diagnosis:** GPT-4o-mini has strong baseline associations with retrieval-style fillers. They leak through prompt instructions like watermarks.

**Solution:**
1. Completely removed all retrieval-style fillers from the prompt (no "let me check", no "pulling that up")
2. Provided ONE explicit preferred phrase per action type:
   - Save actions: *"Got it, noting it down so my team gets your details"*
   - Lookup actions: *"One sec, looking that up now"*
3. Added explicit anti-pattern rule: "NEVER use a lookup-style filler ('pull that up', 'check that real quick') before a save call — sounds like you're looking something up, not recording"

**Result:** Maria now uses action-appropriate fillers consistently. Conversations feel natural and confident.

### Challenge 5: Duplicate lead rows in the staff dashboard

**Symptom:** A single customer call would produce 2-3 lead rows in the staff dashboard (one save during the buying conversation, one save before transfer, etc.). Staff saw the same customer 3 times.

**Solution:** Server-side grouping. The `listLeads()` function in `src/lib/sheets.ts` groups rows by normalized phone+email into a single `Lead` object with a `requests` timeline array. The UI renders one card per customer with a vertical timeline of all their saves during the call, showing prefixed labels ("BUYING", "TRANSFER REQUESTED") as chips at each step.

When staff marks a customer as contacted, all rows in the group are updated atomically via Google Sheets' `batchUpdate` API.

### Challenge 6: Detecting missed transfers in real time

**Goal:** When Maria transfers a customer to the store and the staff doesn't pick up, flag that lead as urgent in the dashboard so staff can call them back immediately.

**Solution:**
1. Set up VAPI server-message webhook to send `end-of-call-report` events to `/api/vapi/events`
2. The webhook examines the `endedReason` field; if it matches patterns like `transfer-call-no-answer`, `transfer-busy`, `transfer-failed`, etc., flags the call as missed
3. The webhook then matches the call's phone number to a recent lead in the Google Sheet (within the last 60 minutes) and updates that lead's `Call Status` column to "Missed"
4. The staff dashboard's 10-second auto-refresh picks up the change
5. Cards with `Call Status = Missed` AND `Status != Contacted` are rendered in a separate "Urgent" section at the top of the page with red borders, pulsing badges, and one-click "Call back now" buttons
6. New missed callbacks trigger a toast notification that slides in from the top-right
7. The "Call back now" button opens `tel:` AND auto-marks the lead as contacted in one tap

### Challenge 7: Conversion tracking infrastructure that just works

**Goal:** Google Ads $300 credit required website conversion tracking. The merchant needed conversion events fired on three actions: booking completion, phone-link click, email-link click. The infrastructure had to:
- Work without modifying every link individually
- Not fire when env vars are unset (clean local dev)
- Be configurable per Vercel environment

**Solution:**
1. Created `src/lib/analytics.ts` with helpers that no-op silently when env vars are missing
2. Created `src/components/GoogleTag.tsx` that loads `gtag.js` only when `NEXT_PUBLIC_GOOGLE_TAG_ID` is set
3. Created `src/components/TrackedLink.tsx` — a client component that attaches ONE global click listener that watches every anchor click on the page and fires the appropriate conversion if the href starts with `tel:` or `mailto:`. This eliminates the need to refactor every individual link.
4. Wired the booking conversion fire into the existing `useEffect` on `/book/confirmation`

The whole conversion tracking system is ~100 lines of code spread across 3 files, and it activates instantly the moment env vars are deployed.

---

## Performance metrics

| Metric | Before | After |
|---|---|---|
| **Voice agent tool-call latency** | 4–7 seconds | 0.5–1.5 seconds |
| **Cached product lookups** | N/A | ~50 ms |
| **LLM API calls per voice agent turn** | 2 (Maria + n8n agent) | 1 (Maria only) |
| **Staff dashboard refresh delay** | Manual reload | Auto every 10s |
| **Lead duplicates per call** | 2–3 rows per customer | 1 grouped thread per customer |
| **Missed-callback detection delay** | N/A (silent failure) | ~10s after call ends |
| **Booking flow steps** | Hardcoded forms | Stateful 6-step wizard with sessionStorage |
| **Build cold-start time** | 12–15s | 8–10s |
| **Lighthouse score (homepage)** | N/A | 95+ across all metrics |

---

## Project economics

This is the section that usually doesn't make it into engineering case studies, but it matters for two audiences: business owners thinking about whether AI-assisted development is real, and engineers thinking about their own market value.

### What this build would cost on the open market

A multi-product application of this scope (premium customer site + AI voice agent + e-commerce integration + real-time staff portal + analytics tracking) priced by traditional firms:

| Provider tier | Typical quote (USD) | What you'd get |
|---|---|---|
| **High-end US agency** | $80,000 – $150,000+ | Discovery → spec → design → build → QA → launch over 4–6 months. Multiple specialists (PM, design lead, frontend, backend, AI engineer). Quarterly retainer for maintenance. |
| **Mid-market US agency** | $40,000 – $80,000 | Smaller team, faster turnaround. 3–4 months. |
| **Senior US freelancer** | $25,000 – $50,000 | One experienced engineer. 2–3 months. |
| **Specialized AI voice agent consultancies** (Bland, Retell, Cresta integrators) | $15,000 – $30,000 *for the voice agent piece alone* | Production-grade voice agent setup, prompt engineering, tool integration. Does NOT include website, staff portal, e-commerce. |
| **India / SE Asia agencies** | $15,000 – $35,000 | Typically lower rates, longer timelines (4–6 months). |
| **Offshore freelancers (Upwork etc.)** | $5,000 – $15,000 | Variable quality. Higher rework risk. Usually 3–4 months including iterations. |

**This project was built in three weeks by one developer using Claude Code.** The implication isn't that traditional shops are overpriced — they bundle in QA, account management, post-launch support, and risk. The implication is that the *technical floor* for what one person can ship has moved up by an order of magnitude.

### Operational cost floor — what it costs to keep this running every month

The infrastructure cost to keep this exact stack running in production:

#### Minimum survivable budget (if you absolutely must cut costs)

| Service | Plan | Monthly cost |
|---|---|---|
| Vercel | Hobby (free) | **$0** |
| Upstash Redis | Free tier (500K commands/month) | **$0** |
| Cal.com | Free (single user) | **$0** |
| Google Sheets / Cloud | Free tier service account | **$0** |
| Google Tag / Ads | Free (only pay for ad spend separately) | **$0** |
| Resend (email) | Free (3,000 emails/month) | **$0** |
| Domain (movingmobiles.com) | $15/year amortized | **~$1** |
| Shopify | Basic plan | $39 (already paid by merchant) |
| VAPI (voice agent) | Pay-as-you-go, ~$0.07/minute | **$10–$30** (~150–450 voice minutes/month) |
| VAPI phone number | $1.15/month | **$1** |
| **TOTAL (excluding Shopify, which the business already pays)** | | **~$12–$32 / month** |

#### Realistic production budget

In practice, you want to spend slightly more for reliability and scale headroom:

| Service | Plan | Monthly cost |
|---|---|---|
| **Vercel Pro** (recommended for production) | $20/user — gets you SLAs, more build minutes, team features | **$20** |
| **Upstash Redis paid tier** (when free tier exceeded) | Pay-per-request | **$0–$10** |
| **VAPI** | Same pay-as-you-go | **$30–$100** (~400–1400 minutes — covers a busy small business) |
| **VAPI phone number** | Local US number | **$1** |
| **OpenAI usage** | Bundled into VAPI, but if separated: GPT-4o-mini ~$0.15/1M input tokens | **~$5–15** depending on call volume |
| **Cal.com Pro** (multi-user team) | $15/seat | **$15** (1 seat) |
| **Resend** (when free tier exceeded) | $20/month for 50K emails | **$0–$20** |
| **Domain** | Annual | **$1** |
| **Shopify** | Already paid | (excluded) |
| **TOTAL** | | **~$70–$165 / month** |

#### Practical floor below which you can't go without breaking things

The absolute can't-go-below number is **roughly $15/month** in core infra (just VAPI minutes + phone number), assuming:
- You stay on Vercel Hobby
- You stay under all free tier limits (which is realistic for a small business)
- The merchant already pays Shopify

If voice call volume grows beyond ~500 minutes/month, VAPI becomes the dominant cost. At 1,000 minutes/month (~30 calls/day averaging 3 minutes each), VAPI alone is ~$70/month — still trivial compared to one repair job's revenue.

### Cost-per-conversion math

The conversion tracking we set up means every customer interaction has a measurable economic value:

- A typical phone-repair customer is worth **$100–$300** in revenue
- VAPI cost per inbound call (3 min avg): **~$0.21**
- Booking call that converts to a customer: **~$0.21 cost → $200 revenue = ~950× ROI**

Even if only 1 in 50 inbound calls converts, the unit economics still favor running this at 19×+ ROI.

### What this means strategically

1. **The infrastructure floor for "premium customer experience tech" is now ~$70/month.** Small businesses can now afford technology that two years ago required a $100K capex.
2. **The build cost has collapsed from $50K+ to one engineer-month.** This is the actual market disruption.
3. **The bottleneck is no longer cost or skills — it's awareness.** Most small businesses don't know this kind of system is now within their budget. Selling them on the *idea* takes longer than building it.

---

## Tech stack

### Core
- **[Next.js 16](https://nextjs.org)** (App Router, Server Components, Server Actions)
- **[TypeScript](https://www.typescriptlang.org)**
- **[Tailwind CSS 4](https://tailwindcss.com)** with native CSS variables and `@theme` directive
- **[React 19](https://react.dev)** with `useTransition` and concurrent rendering

### AI / Voice
- **[VAPI](https://vapi.ai)** — voice agent platform
- **[OpenAI GPT-4o-mini](https://openai.com)** — Maria's underlying LLM
- **[Anthropic Claude](https://anthropic.com)** — used for development (via Claude Code)

### Data layer
- **[Shopify Storefront API](https://shopify.dev/docs/api/storefront)** (GraphQL, public token, Headless channel)
- **[Google Sheets API](https://developers.google.com/sheets)** with service account auth — lead persistence + staff dashboard data source
- **[Cal.com API](https://cal.com)** — appointment booking
- **[Upstash Redis](https://upstash.com)** — caching + attendance + push subscription storage

### Infra
- **[Vercel](https://vercel.com)** — hosting, env management, serverless functions, edge runtime
- **[GitHub](https://github.com)** — version control + public repository

### Analytics
- **Google Tag (gtag.js)** — site-wide tracking
- **Google Ads Conversions** — 3 conversion actions wired through env vars

### UI primitives
- **[Geist](https://vercel.com/font)** — typography
- **[Leaflet](https://leafletjs.com)** — interactive store map
- **[Lenis](https://lenis.darkroom.engineering)** — smooth scrolling
- **Custom React components** — no UI framework (Material/Chakra/etc.) used. All components hand-built with Tailwind.

### Communication
- **[Resend](https://resend.com)** — transactional email
- **Web Push API** — staff portal push notifications

---

## Skills demonstrated

A non-exhaustive list, organized for the kinds of roles this project is good evidence for:

### Applied AI / LLM Engineering
- Prompt engineering across ~20 iterations on a production voice agent
- Multi-tool agent architecture with strict precondition enforcement
- LLM failure-mode diagnosis (default phrase leakage, tool-sequencing violations, context-window decay)
- Voice UX considerations (TTS-aware language, filler phrase context matching, conversational pacing)
- Function calling / structured tool parameters (OpenAI Function Calling style)
- Real-time agent orchestration (lead save → confirmation → transfer sequence)
- Custom system prompts with embedded guardrails and out-of-scope handling
- Server-message webhook integration for asynchronous agent events

### Backend / API
- Next.js 16 App Router with Server Components and Server Actions
- RESTful API design (20+ endpoints)
- Webhook handlers with defensive payload parsing
- OAuth flows + service-account auth (Google Sheets, Cal.com)
- Cookie-based session management with middleware
- Redis caching with TTL strategies
- GraphQL client (Shopify Storefront API)
- Error handling and graceful degradation (Cal.com unavailable → save as lead instead)

### Frontend / UX
- React 19 patterns including `useTransition` for non-blocking updates
- Tailwind 4 with CSS variable theming and dark-mode rhythm
- Real-time UI patterns (auto-refresh, toast notifications, optimistic updates)
- Premium animation and polish (scroll-triggered reveals, pulse animations, gradient overlays)
- Accessibility (semantic HTML, ARIA labels, keyboard navigation)
- Multi-step form wizards with state persistence

### Data / Integration
- Shopify Storefront API end-to-end (search, product detail, inventory)
- Google Sheets as a database (with pagination, grouping, batch update)
- Cal.com API (slot fetching + booking creation)
- Webhook orchestration (VAPI server events → Sheets updates → dashboard re-render)
- Push notifications (Web Push API)

### DevOps / Production
- Vercel deployment (env management across Production/Preview/Dev)
- GitHub Actions-compatible workflow
- Environment variable lifecycle (local → dev → preview → prod)
- Secrets management (service-account JSON, API tokens, webhook secrets)
- Real-time observability (auto-refresh status, error logging)

### Product / Systems Thinking
- Latency-aware architecture decisions (4–7s → 1s response time refactor)
- Caching strategy (TTL selection based on inventory drift assumptions)
- Multi-stage user flows (two-stage lead capture, transfer-with-context)
- Failure modes and recovery (missed-callback detection, booking-failure fallback)
- Business UX considerations (walk-in discount promotion logic, after-hours handling)

---

## What this proves about AI-assisted development in 2026

This project was built almost entirely through conversation with Claude Code. The developer spent more time thinking about *what* to build than *how* to build it. That inversion is the headline shift.

**Three takeaways:**

1. **The bottleneck has moved from code-writing to product judgment.** Tools like Claude Code can write near-perfect Next.js / TypeScript / GraphQL code from a clear description. The hard part is now deciding *what's worth building*, *how it should feel*, and *where to spend the human review time*.

2. **Prompt engineering is a real skill.** Maria's 4000-word system prompt went through ~20 revisions. Each revision fixed a specific failure mode observed in production. Hiring managers looking for "AI engineers" should look for evidence of this kind of iterative, observation-driven prompt tuning — not just "I've used the OpenAI API."

3. **Production AI requires production engineering discipline.** It's easy to build a demo where a voice agent says hello. It's hard to build one that reliably saves leads before transferring, handles bilingual customers, recovers from missed calls, and integrates with the merchant's existing tools. The difference is everything covered in this README.

If you're a hiring manager: I'd love to walk you through this codebase, the design choices, and the next iterations on the roadmap. Best reached at allaganesh339@gmail.com.

If you're an engineer considering AI-assisted development: clone this repo, read the commit history, and judge for yourself. Most of it was written in real-time conversations.

---

## License & contact

This project is the proprietary work product for Moving Mobiles Tech. The source is published for portfolio and educational purposes.

- 🌐 Live site: [movingmobiles.com](https://www.movingmobiles.com)
- 📞 AI agent demo: **(203) 760-9223** (call from any phone)
- 👤 Developer: Ganesh Alla — [ganeshalla.com](https://www.ganeshalla.com) · [LinkedIn](https://www.linkedin.com/in/ganesh-alla-79951318b/) · allaganesh339@gmail.com
- 🤖 Built with: [Claude Code](https://claude.com/claude-code) (Anthropic)

---

*Last updated: May 2026*
