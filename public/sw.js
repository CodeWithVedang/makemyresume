/*
 * Service worker: installable app + offline-friendly shell.
 *
 * - Build assets (/_next/static) are immutable: cache-first.
 * - Public marketing pages: network-first with a cached fallback.
 * - Private pages (dashboard, editor) and all API/auth/print routes are never
 *   cached, so personal resume data is not stored by the service worker.
 *   An already-open editor keeps working offline: edits are kept in
 *   localStorage and synced by the page when the connection returns.
 * - Anything else that fails offline falls back to /offline.
 */
const VERSION = "v2";
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const PRECACHE = ["/offline", "/", "/icon.svg", "/icons/192", "/icons/512"];
const PUBLIC_PAGES = new Set(["/", "/templates", "/features", "/about", "/guides", "/offline"]);
const NEVER_CACHE = [/^\/api\//, /^\/print\//, /^\/r\//, /^\/dashboard/, /^\/resume\//, /^\/settings/, /^\/onboarding/, /^\/login/, /^\/signup/, /^\/reset-password/, /^\/forgot-password/];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![SHELL_CACHE, ASSET_CACHE].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    if (NEVER_CACHE.some((re) => re.test(url.pathname))) {
      event.respondWith(fetch(request).catch(() => caches.match("/offline")));
      return;
    }
    if (PUBLIC_PAGES.has(url.pathname)) {
      event.respondWith(networkFirst(request));
      return;
    }
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  if (url.pathname.startsWith("/icons/") || url.pathname === "/icon.svg") {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match("/offline"));
  }
}
