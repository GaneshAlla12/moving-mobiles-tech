# Project Retrospective — Moving Mobiles Tech

A direct, no-sugar-coat retrospective on building this project. Read this when you're about to start your next one and want to remember what actually happened.

**Project**: A custom web platform for a 6-month-old Connecticut mobile repair shop.
**Final scope**: 30+ pages, 4 staff portal modules, Cal.com booking integration, Shopify storefront, Upstash Redis backend, time clock, scheduling, pricing CMS.
**Charged**: $350. **Realistic 2026 market value**: $5,000–$7,500.
**Time invested**: ~25–35 focused hours across ~3 days.

---

## Phase-by-phase, what really happened

### Phase 1 — Original build (May 6 → 8)
Built the marketing site, booking flow, Shopify storefront, staff portal, security hardening before this session even started. Solid foundation. No major issues.

### Phase 2 — Storage configuration (start of this session)
Tried to use the staff CMS without configuring Upstash. Got the "Storage not configured" warning. **Stumbled here**: when entering the Upstash token into Vercel, you split the token across the Value field AND the Note field — half the secret in each. Took two debug rounds to find. Classic config error.

### Phase 3 — Promo carousel + cinematic hero
Created 7 daily promotion graphics in Canva (with a redo on Day 5). Generated a Higgsfield AI hero image. Smooth phase. You picked options confidently and moved on.

### Phase 4 — Apple-level redesign (5-phase rebuild)
This is where you showed maturity. You asked **"can you revert back to current state of website"** before letting me touch anything. We tagged `pre-redesign` and you got an explicit reset point. **Best decision of the project.**

I executed all 5 phases (foundation tokens → hero rebuild → dashboard polish → mobile pass → a11y audit) and you accepted them as a batch. Good — micromanaging design phases would have wasted hours.

### Phase 5 — Cal.com integration
You picked Cal.com over Google Calendar without much deliberation. **Right call.** You also asked the right architectural question: *"why is Upstash Redis better than Supabase?"* — that showed real engineering thinking, not just "make it work."

You pasted the API key directly in chat. **Mistake**: API keys are credentials. The chat history will live somewhere — never paste live secrets in plain text. Use Vercel's web UI to add them and tell me "I added it" instead.

### Phase 6 — Pricing CMS
Asked for a way to edit prices through the admin. Clean ask, clean build, no friction.

### Phase 7 — Staff scheduling
Asked if employee scheduling was hard. I gave you 4 tiered options. You picked option 2 (boss-makes-weekly-schedule) — fine. I **specifically recommended Homebase** because it's free, mobile-first, and purpose-built. You chose to build custom anyway.

**Honest take**: this wasn't wrong, but you'll spend more lifetime maintaining a custom scheduler than Homebase would have cost you in 5 years. The build was fun, the maintenance is forever. Worth knowing for next time.

### Phase 8 — Time clock + per-employee PINs
You initially wanted manual clock-in buttons. Then changed direction: *"i want it count in. as people signin and signout, like auto detect."* — much better UX call. The whole flow had to be reworked.

**Lesson**: spec the UX once, then commit. Mid-build pivots are expensive in real money even if they look free here.

### Phase 9 — Polish loop
Carousel arrows moved 3 times (sides → bottom → sides again). Header dropdown opacity. Logout redirect. Schedule picker positioning. **This is normal** — but each polish round costs real time and code churn.

---

## What you did well

1. **Asked about reversibility before destructive changes.** You said *"make sure you will be able to revert back to current state of website"* before the redesign. That instinct is rare and valuable.

2. **Architecture questions, not just feature requests.** *"Why is Upstash better than Supabase?"* and *"is Cal.com more than enough?"* Both showed you wanted to understand trade-offs, not just consume answers.

3. **Decisive picking.** When given options A/B/C, you usually picked quickly. *"Day 1 - B. Day 5 - B. Day 6 - C."* No analysis paralysis.

4. **UX taste.** You spotted real issues — the dropdown was too transparent, the carousel arrow looked off, the logout was redirecting wrong. Each of these would have shipped to customers if you hadn't caught them.

5. **You scoped down at the right moments.** Didn't ask for analytics dashboards, AI chat widgets, or other shiny things you didn't need yet. Discipline.

6. **Trusted, then verified.** You tested deployed features and reported back. That's the right loop.

7. **Asked about market value.** Showed you were thinking about this as a business asset, not just a school project.

---

## Where you stumbled (no sugar coat)

1. **Pasted live API keys in chat.** Cal.com `cal_live_06e0ab...` and Upstash credentials went into plain text. Treat secrets like cash — don't hand them to anyone, including me. Use Vercel's UI directly.

2. **Split the Upstash token across two Vercel fields.** Basic config error that took an hour to debug. **Lesson**: when pasting a long string, scroll the input to confirm it's all in one field before tabbing away.

3. **No git remote configured.** 25 commits live only on your laptop. If your drive dies tomorrow, you lose the entire version history. **Fix this before doing anything else** — push to a private GitHub repo. Five minutes of work.

4. **No custom domain.** This caused the Shopify checkout logo issue (clicking it leaves your site). Also limits SEO, email professionalism, and customer trust. A real domain costs $10/year — don't skip this for production.

5. **Asked the same question twice.** *"where is all this data being stored?"* — verbatim, twice. It signals you weren't fully digesting answers. Tactical fix: when you get a long answer, summarize it back to yourself in 1 sentence to confirm you actually grokked it.

6. **Mid-build UX pivots.** The clock-in flow built, then completely rebuilt because you decided you wanted auto-detect instead. Real shops would charge double for that.

7. **"Perfect" → "more changes" loop.** *"perfect"* was said multiple times immediately followed by another change request. Normal in iteration but worth recognizing — when you say "perfect" you're really saying "this is the floor; now let's add."

8. **Vague prompts.** *"lets continue cal.com"*, *"can you make this UI so fun and premium"*, *"its something off"* — relied on me to interpret. The clearer your prompt, the better the result. *"make the carousel arrows blue and 12px from the edge"* would have saved an iteration.

9. **Built scheduling against my recommendation.** I told you Homebase was the better choice for your situation. You built custom. Not wrong — but be honest about why you chose it (because it was *fun*, not because Homebase was lacking).

10. **Didn't push back on my over-engineering.** I added Lenis smooth scroll, magnetic buttons, glassmorphism — all of it cool, none of it strictly necessary for a repair shop. A more skeptical client would have questioned the complexity-vs-business-value of some of those choices. **Don't accept "premium" features just because they sound nice.** Ask: *will my customers actually notice or care?*

---

## Things you got asked about but didn't act on

| Item | Status | Why it matters |
|---|---|---|
| Connect to GitHub | Not done | Source code only on your laptop |
| Custom domain | Not done | Affects checkout UX, email, SEO, trust |
| Set Cal.com event type availability hours | You said you would; verify it's set | Customers can't book outside shop hours |
| Cal.com link calendar (Google/Apple) | Not confirmed | Affects whether shop owner sees bookings in their personal calendar |
| Email confirmations to shop owner | Skipped (Cal.com handles it) | Make sure your Cal.com email notifications are turned on |
| Analytics (GA4, Plausible) | Not done | You can't optimize what you can't measure |
| Backup strategy for Upstash | Discussed, not implemented | Free tier doesn't auto-backup |

Each of these is 5-30 minutes of work. You're not going to remember them next month. **Do the GitHub push and custom domain right now** — those are the two with real risk.

---

## Hard-won learnings (write these on your wall)

1. **Reversibility is a moat.** The `pre-redesign` git tag let you commit to bold changes without fear. Always tag a "known good" state before any large change.

2. **Configuration is where projects die.** More time was spent debugging env vars (Upstash, Cal.com) than building features. **When something fails, check config before code.**

3. **Custom is expensive forever.** Every custom feature you build (scheduling, attendance) becomes a forever maintenance commitment. Use SaaS where it exists; build custom only where SaaS genuinely can't serve you.

4. **The market doesn't care about your premium tooling.** Your customer is a person trying to fix their phone. They don't care about Geist font or Lenis smooth scroll. **Build for the user's problem, not for engineering elegance.**

5. **AI-assisted dev is a 3–4x multiplier, not 100x.** ~30 hours of your attention bought ~100 hours of equivalent solo-dev work. That's real and valuable. It's also not magic — every hour of your attention still mattered.

6. **Friend pricing harms you and the market.** $350 for a $5K–7.5K product means: (a) you undervalued your time, (b) the client thinks $350 is what custom software costs, (c) future clients see this as the comp. **Don't quote below $1,500 again, even for friends.**

7. **You make better decisions when given trade-offs, not options.** You picked confidently when I framed choices as "A is faster but Y; B is slower but X." You hesitated when I just listed features. **Always demand trade-offs from advisors.**

8. **Premium UI ≠ premium product.** A Linear-grade staff dashboard doesn't compensate for missing automation, integrations, or business logic. Spend the polish budget proportionally.

---

## What to do differently on the next project

**Before writing any code:**
1. Decide what's already a SaaS solution and use those. Custom only where SaaS genuinely doesn't fit.
2. Lock in the price (don't undersell — $5,000 minimum for a project this size).
3. Get all credentials/access set up: GitHub repo, custom domain, all third-party API keys.
4. Spec the UX in writing for major flows. Stick to the spec.

**During the build:**
5. Tag known-good states before risky changes.
6. Push to git remote after every meaningful commit.
7. When something feels off, debug *config* before *code*.
8. Resist mid-build UX pivots. Note them, ship the original, iterate later.
9. Question "premium" features — would the customer pay extra for this?

**After the build:**
10. Verify all third-party setup (calendar links, availability hours, email confirmations).
11. Add analytics on day one. You can't improve what you don't measure.
12. Set up a backup of your Redis data (export weekly to a Drive folder).
13. Write a 1-page handoff document for the client so they can run it without you.

---

## The honest summary

You built a real product. Most people who attempt this give up at the Upstash setup screen. You shipped a 30-page Apple-level platform with 4 admin modules and 3 third-party integrations in ~30 hours of focused attention. That's genuinely impressive output.

You also made every classic first-time-builder mistake: leaked secrets in chat, no remote git, no custom domain, scope creep, mid-build pivots, and undercharged by a factor of 15. None of those are fatal, but together they're the difference between "talented amateur" and "professional."

The next project is when you find out which one you are. The work itself didn't make you a professional — what you do with the *learnings* from this project does.

---

*Written 2026-05-09 with full conversation context, no sugar coat.*
