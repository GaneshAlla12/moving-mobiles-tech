/* Moving Mobiles — Staff PWA service worker
 *
 * Strategy:
 *   - Scope: /staff/ (set when registered from PWAManager)
 *   - Static shell + icons → cache-first
 *   - HTML pages → network-first with cached fallback
 *   - GET /api/staff/* → network-first with cached fallback (so the
 *     attendance/schedule pages still render last-known data offline)
 *   - POST/PUT to /api/staff/* → network-only when online; queued in
 *     IndexedDB for retry when offline (so a clock-out doesn't get lost
 *     if wifi flickers mid-tap)
 *   - Push events → render a notification routed to /staff/appointments
 */
const VERSION = "v1.0.0";
const CACHE_SHELL = `mm-staff-shell-${VERSION}`;
const CACHE_PAGES = `mm-staff-pages-${VERSION}`;
const CACHE_API = `mm-staff-api-${VERSION}`;

const SHELL_ASSETS = [
  "/staff/identify",
  "/staff/attendance",
  "/staff/schedule",
  "/staff/appointments",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_SHELL);
      // Best-effort: don't fail install if any one asset 404s
      await Promise.allSettled(SHELL_ASSETS.map((u) => cache.add(u)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (n) =>
              n.startsWith("mm-staff-") &&
              ![CACHE_SHELL, CACHE_PAGES, CACHE_API].includes(n),
          )
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests inside our scope
  if (url.origin !== self.location.origin) return;

  // 1) Mutating API calls — try network; if offline, queue + report success
  //    (best-effort; the user sees the action as accepted, replays on reconnect)
  if (
    /^\/api\/staff\//.test(url.pathname) &&
    (req.method === "POST" || req.method === "PUT" || req.method === "DELETE")
  ) {
    event.respondWith(handleMutating(req));
    return;
  }

  // 2) GET /api/staff/* — network-first, fall back to cache
  if (req.method === "GET" && /^\/api\/staff\//.test(url.pathname)) {
    event.respondWith(networkFirst(req, CACHE_API));
    return;
  }

  // 3) Staff HTML pages — network-first, fall back to cached shell
  if (
    req.mode === "navigate" &&
    (url.pathname.startsWith("/staff") ||
      url.pathname.startsWith("/repair-cost"))
  ) {
    event.respondWith(networkFirst(req, CACHE_PAGES));
    return;
  }

  // 4) Static assets (icons, etc.) — cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(cacheFirst(req, CACHE_SHELL));
    return;
  }
});

async function networkFirst(req, cacheName) {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function handleMutating(req) {
  try {
    return await fetch(req.clone());
  } catch {
    // Queue for retry via Background Sync if available
    try {
      await queueRequest(req);
      if ("sync" in self.registration) {
        await self.registration.sync.register("mm-replay-mutations");
      }
      return new Response(
        JSON.stringify({
          ok: true,
          queued: true,
          message: "Saved offline — will sync when back online",
        }),
        { status: 202, headers: { "Content-Type": "application/json" } },
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ ok: false, error: "Offline and queue failed" }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }
  }
}

self.addEventListener("sync", (event) => {
  if (event.tag === "mm-replay-mutations") {
    event.waitUntil(replayQueue());
  }
});

// Tiny IndexedDB queue ----------------------------------------------------
const DB = "mm-staff-pwa";
const STORE = "queue";
function openDb() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => {
      open.result.createObjectStore(STORE, { autoIncrement: true });
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}
async function queueRequest(req) {
  const db = await openDb();
  const body = await req.clone().text();
  const headers = {};
  req.headers.forEach((v, k) => (headers[k] = v));
  const record = {
    url: req.url,
    method: req.method,
    headers,
    body,
    queuedAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function replayQueue() {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const all = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const keys = await new Promise((resolve, reject) => {
    const req = store.getAllKeys();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  for (let i = 0; i < all.length; i++) {
    const r = all[i];
    try {
      const res = await fetch(r.url, {
        method: r.method,
        headers: r.headers,
        body: r.method === "GET" ? undefined : r.body,
        credentials: "include",
      });
      if (res.ok || res.status === 409) {
        // Success or "already done" (idempotent dup) — drop from queue
        await new Promise((resolve) => {
          const tx2 = db.transaction(STORE, "readwrite");
          tx2.objectStore(STORE).delete(keys[i]);
          tx2.oncomplete = () => resolve();
        });
      }
    } catch {
      // Still offline — leave queued for next sync
      break;
    }
  }
}

// Web Push ---------------------------------------------------------------
self.addEventListener("push", (event) => {
  let payload = { title: "Moving Mobiles", body: "", url: "/staff/appointments" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: payload.tag ?? "mm-default",
      data: { url: payload.url ?? "/staff/appointments" },
      vibrate: [120, 60, 120],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/staff/appointments";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = all.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })(),
  );
});
