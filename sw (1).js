/* ============================================================================
   Khedmain — service worker (PWA)
   Strategy:
   - App shell (index + icons + manifest): cached on install.
   - Navigations: network-first, fall back to the cached shell when offline.
   - API calls (khedmain-backend): never cached — always fresh from the network.
   - Fonts / other same-origin GET: cache-first (they rarely change).
   Bump CACHE on each release so old assets are purged.
   ============================================================================ */
const CACHE = 'khedmain-v1';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never cache API traffic — the marketplace data must always be live.
  if (url.hostname.endsWith('onrender.com')) return;

  // Page navigations: network-first so updates show, cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/').then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // Everything else (fonts, icons, static assets): cache-first.
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit)
    )
  );
});
