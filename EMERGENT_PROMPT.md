# Emergent AI Prompt — MM Staff Native App

Paste everything below into Emergent. It's structured so the AI knows what to
build, what NOT to build, and exactly which existing API endpoints to consume.

---

## PROMPT START — paste from here

Build me a **native iOS + Android app** called **MM Staff** for a mobile repair shop in Connecticut.

**Critical constraint**: I already have a backend deployed at `https://mm-site-six.vercel.app` and a Cal.com integration. **DO NOT rebuild the backend.** This app is a native frontend that consumes the existing APIs. If you find yourself building Supabase tables or a custom auth system, stop — those already exist.

### Tech stack (use exactly this)

- **React Native with Expo** (managed workflow, EAS Build for distribution)
- **TypeScript** strict mode
- **Expo Router** (file-system routing)
- **Zustand** or React Context for global state (not Redux — overkill)
- **expo-secure-store** for session tokens / PIN cache
- **expo-notifications** for push
- **react-native-reanimated** for animations
- **No backend code.** All data comes from HTTP calls to my existing Vercel endpoints below.

### Authentication — 3 steps, in order

**Step 1 — Email + Password (shared staff password)**
- Screen: email input + password input + "Sign in" button
- POST `https://mm-site-six.vercel.app/api/staff/login` with `{ email, password }`
- On 200: server sets `mm-staff` HTTP-only cookie. Store the cookie token in `expo-secure-store`. (You'll need to send it as a Cookie header on subsequent requests, OR use `fetch` with `credentials: include`.)
- On 401: show "Wrong email or password"

**Step 2 — Pick your identity (5 employees)**
- After successful login, show 5 large tappable cards in a 2-column grid
- Each card: circular initial avatar, name, "Tap to clock in" subtitle
- Employees + accent colors (use these EXACTLY):
  - **Satya** — `#0071e3` (Apple blue)
  - **Niteesh** — `#8b5cf6` (purple)
  - **Bharath** — `#10b981` (emerald)
  - **Trainee** — `#f59e0b` (amber)
  - **Liv** — `#ec4899` (pink)

**Step 3 — PIN entry (4 digits)**
- After tapping a name, show a centered avatar (88×88) in their color + 4 hollow PIN dots + a numeric keypad (3×4 grid: 1-9, then blank/0/backspace)
- As digits are entered, the dots fill with the employee's color
- Auto-submit on 4th digit
- POST `https://mm-site-six.vercel.app/api/staff/identify` with `{ employee, pin }`
- On 200: success — navigate to home tab
- On 401: shake the dots horizontally (use react-native-reanimated), clear, show error "Wrong PIN"

### Tabs (bottom tab bar after sign-in)

Five tabs, each with its own icon. The currently signed-in employee's avatar appears in the top-right of every screen — tap it to clock out.

1. **Appointments** (calendar icon)
2. **Schedule** (people icon)
3. **Attendance** (clock icon)
4. **Pricing** (dollar icon)
5. **Shop** (storefront icon)

### Screen 1 — Appointments

- **Header**: "Appointments" title + segmented control "Upcoming / Past"
- **Body**: list grouped by day. Day header shows "Today" / "Tomorrow" / weekday name + full date
- Each booking card:
  - Left block: time (e.g., "10:00 AM → 10:30 AM") in the brand blue color
  - Customer name (bold) + email (tappable, opens mail)
  - Device + issue (from metadata)
  - Reference code (small mono font)
  - "Open in Cal.com" link → opens external URL
- Status pills if cancelled (red) or rescheduled (amber)
- Pull-to-refresh

**Data**: GET `https://mm-site-six.vercel.app/api/staff/appointments?view=upcoming` (or `?view=past`)
Returns `{ bookings: CalBooking[] }` where each booking has `{ uid, status, start, end, attendees: [{name, email}], metadata: { reference, brand, model, issues } }`.

(Note: I haven't built this endpoint yet — Emergent, build it as part of this app's backend if it doesn't exist. OR call Cal.com API directly: `GET https://api.cal.com/v2/bookings?eventTypeIds={ID}&afterStart={ISO}&beforeStart={ISO}&status=accepted` with Bearer auth and header `cal-api-version: 2024-08-13`. I'll provide the Cal.com API key as an env var.)

### Screen 2 — Schedule

- **Header**: current week label + prev / this-week / next buttons
- **Top strip**: 5 employee summary cards in a horizontal scroll, each showing avatar, total hours this week, animated hour bar (0–40h baseline)
- **Body**: a 7-column × 5-row grid (Mon–Sun across the top, employees down the left)
  - Each cell shows either a colored shift card (employee's gradient + start time + end time) or a dashed `+` placeholder
  - Tap an empty cell → modal opens with 3 preset times (10:00, 12:00, 14:00) + a custom time input + Cancel/Save buttons
  - Tap a shift card → same modal with current time pre-filled + a red "Remove shift" button
  - Cells in past days render as read-only muted cards (no tap action)
- **Bottom**: "Daily coverage" strip showing count/5 per day with stacked mini-avatars
- **Save week** button in the top right

**Data**:
- GET `https://mm-site-six.vercel.app/api/staff/schedule?week=YYYY-MM-DD` (Monday) → `{ shifts: [{employee, date, startTime}] }`
- PUT `https://mm-site-six.vercel.app/api/staff/schedule` with `{ weekStart, shifts }`

Shifts are always 5 hours. End time = start + 5h.

### Screen 3 — Attendance

- **Today by default**, with a date picker to view past days
- For today: live ticking — every 30 seconds, refetch and update
- 5 cards (one per employee):
  - Avatar + name
  - Status: 🟢 "Clocked in at 9:32 AM" / ⚪ "Signed out at 5:01 PM (7h 29m)" / ⚫ "Off today"
  - Live total minutes worked (use a setInterval to tick up if currently clocked in)
  - Expand to see segments (each in/out pair as a sub-row)
- **Below**: full punch timeline of the day (chronological list)
- **Push toggle card** at top: "Push notifications" + Enable/Disable button

**Data**: GET `https://mm-site-six.vercel.app/api/staff/attendance?date=YYYY-MM-DD` → `{ log: { punches }, summaries: [...] }`

Clock-in/out is automatic via login/logout — NO manual clock buttons in this app.

### Screen 4 — Pricing (Repair cost CMS)

- Two pickers: Brand (iPhone / Samsung Galaxy / MacBook / Other laptop) → Model
- Card below shows 6 price rows (Battery, Screen, etc.) with editable number inputs
- Overridden values have a blue ring around the input + "Overridden · default $X" hint
- Each row has a reset arrow to revert to default
- "Reset all" button restores all rows to default
- "Save changes" button (disabled when no unsaved changes)
- A "0" price displays as "Varies — bring it in" on the public site

**Data**:
- GET `https://mm-site-six.vercel.app/api/staff/pricing` → `{ overrides: { prices: { "iphone|iphone-17|Battery service": 109 } } }`
- PUT same URL with `{ prices: {...} }`

### Screen 5 — Shop CMS

- List of all collections (~26 items), each with reorder up/down arrows
- Each row: position number, collection name, "X featured" pill, visible toggle, "Pick featured" expand button
- Expanded: drag-to-reorder selected featured products + grid of all products in the collection (tap to add/remove, max 6 featured)

**Data**:
- GET `https://mm-site-six.vercel.app/api/staff/shop-config` → `{ collections: [{handle, hidden, featured: [productId]}] }`
- PUT same URL with the new config

### Push notifications

- After install, on first launch of the home tab, show a one-time prompt: "Get notified when a booking comes in" → tap Enable → request permission
- Use Expo Push Notifications. Subscribe to a topic / get an Expo push token
- POST the token to `https://mm-site-six.vercel.app/api/staff/push/subscribe` with `{ subscription }`
- Backend already handles fanning out push on new bookings

### Sign out

- Tap the avatar in the top-right of any screen → confirm sheet "Clock out, Satya?" → Yes
- POST `https://mm-site-six.vercel.app/api/staff/logout` (server handles the auto-clock-out punch)
- Clear the secure-stored cookie + identity
- Return to login screen

### Design system

**Typography**: SF Pro Display (iOS native) / Roboto (Android native). Tight letter-spacing on headlines (-0.022em). Body 17px, 1.5 line-height.

**Color tokens**:
- `--ink` (text): light mode `#0a0a0a`, dark `#f5f5f7`
- `--canvas` (background): light `#ffffff`, dark `#0a0a0a`
- `--canvas-elevated`: light `#fafafa`, dark `#131316`
- `--canvas-sunken`: light `#f5f5f7`, dark `#050507`
- `--hairline` (borders): light `rgba(0,0,0,0.08)`, dark `rgba(255,255,255,0.08)`
- `--primary` (Apple blue): `#0071e3`
- Employee accents listed above

**Spacing**: 4px base scale. Use 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64.

**Radius**: cards `20px`, buttons `999px` (pill), inputs `12px`.

**Shadows**: Apple-style — barely-there hairlines + huge soft drops. Avoid hard 1-pixel `#ccc` shadows.

**Animations**: cubic-bezier(0.32, 0.72, 0, 1) for most transitions. 200ms for hover/press, 320ms for screen transitions.

**Dark mode**: auto-detect system theme, allow user toggle in a settings sheet.

### Critical do-nots

- **DO NOT rebuild the backend.** All endpoints exist at `mm-site-six.vercel.app`.
- **DO NOT use Supabase, Firebase, or any new DB.** Storage is Upstash Redis behind the existing API.
- **DO NOT change the auth flow** (email+password, then identity, then PIN). It's deliberate.
- **DO NOT add screens I didn't list** (no "settings", no "profile editing"). Tab bar is final.
- **DO NOT use a UI library** (no NativeBase, no Tamagui, no Restyle). Build with bare RN + StyleSheet.

### Env vars Emergent should configure

Ask me for these values:
- `EXPO_PUBLIC_API_URL` = `https://mm-site-six.vercel.app`
- `EXPO_PUBLIC_VAPID_PUBLIC_KEY` (for push)

### Distribution

- iOS: ship via TestFlight initially, App Store later
- Android: ship via Play Store internal testing initially, public later
- I'll provide the Apple Developer Program + Google Play Console credentials when ready

---

## PROMPT END

---

# Notes for me (Ganesh) — do NOT paste this part into Emergent

## Before pasting

1. **Confirm Emergent can build React Native apps**, not just web. If not, swap "React Native + Expo" for "Next.js PWA" — but you already have that, so this would be moot.
2. **Test the auth endpoint first**: Emergent will likely hit a cookie issue because `fetch` cross-origin doesn't auto-include cookies. You may need to switch the staff session from HTTP-only cookie to a Bearer token. (That's a 30-min change on the Vercel side I can do.)

## After Emergent generates the app

1. Verify the API endpoints it uses match the ones above. AIs often invent paths.
2. Check the PIN entry flow — most AIs simplify it to a single password field. Force them to keep the 4-digit keypad.
3. Push notifications require Apple's APNs certificates + Google FCM keys. Emergent will need help setting these up — that's an Apple Developer ($99/yr) + Firebase free tier task.
4. The first build will probably ship without Cal.com / Shopify integration. That's fine — those are the staff backend's job, not the app's.

## Expected gotchas

- **iOS push needs APNs setup** in Apple Developer + Firebase. Emergent might skip this; you'll hit it on first device test.
- **Cookie auth across the React Native fetch boundary** is a footgun. If Emergent's output doesn't work, the fix is switching to a `Authorization: Bearer` token header on `/api/staff/*`.
- **EAS Build (for App Store distribution)** costs money on Expo's paid plan — about $99/yr (separate from Apple's $99/yr).

## If you decide AGAINST native and want to stick with the PWA

Tell me — the prompt is generic enough to also work for "build a React app pointed at these APIs" if you want a separate web-based admin panel hosted elsewhere. But the PWA you already have IS that.
