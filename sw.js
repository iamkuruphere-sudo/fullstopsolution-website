/**
 * FULLSTOP SOLUTION - SERVICE WORKER (PWA & OFFLINE ENGINE)
 * Cache-First for static assets, network-first for pages.
 * 100% Client-Side zero telemetry architecture.
 */

const CACHE_NAME = 'fullstop-v2.7.0';
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
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache successful GET responses for assets
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
