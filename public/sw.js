// Minimal service worker for Leyton Arena.
// Strategy:
//   - HTML navigations: network-first with offline fallback to cached index.
//   - Built static assets (/assets/*): cache-first, served from cache once seen.
//   - Logo / manifest: cache-first.

const CACHE = 'arena-v1'
const CORE = ['/', '/index.html', '/logo.svg', '/manifest.webmanifest', '/og-image.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // SPA navigation — try network, fall back to cached index.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('/index.html', copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match('/index.html').then((r) => r || Response.error())),
    )
    return
  }

  // Built assets — cache-first.
  if (url.pathname.startsWith('/assets/') ||
      url.pathname.endsWith('.svg') ||
      url.pathname === '/manifest.webmanifest') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
          return res
        })
      }),
    )
  }
})
