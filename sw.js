/**
 * FULLSTOP SOLUTION - SERVICE WORKER (PWA & OFFLINE ENGINE)
 * Strategy: Network-First for navigation/HTML documents (prevents stale rollouts),
 * Stale-While-Revalidate for cached static assets, with automatic cache invalidation.
 */

const CACHE_NAME = 'fullstop-v3.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/js/tools.js',
  '/assets/js/checkout.js',
  '/assets/js/analytics.js',
  '/assets/images/logo.png',
  '/assets/images/logo-icon.svg',
  '/assets/images/logo.svg',
  '/assets/fonts/PlusJakartaSans-Bold.woff2',
  '/assets/fonts/PlusJakartaSans-ExtraBold.woff2',
  '/security.html',
  '/privacy-policy.html',
  '/terms.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 1. Navigation / HTML Requests: Network-First with Cache Fallback
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // 2. Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
