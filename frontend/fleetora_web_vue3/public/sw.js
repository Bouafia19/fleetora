// Fleetora Enterprise PWA Service Worker
const CACHE_NAME = 'fleetora-pwa-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/fleetora-icon-192.png',
  '/fleetora-icon-512.png',
  '/fleetora-icon-maskable-512.png',
  '/brand/fleetora-gps-icon.svg'
];

// Install event: Pre-cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Fleetora SW] Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up legacy caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first for navigation, stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip non-GET requests and cross-origin APIs (e.g. Google Maps, Backend APIs, Socket.io)
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Do not intercept external API or Google Maps requests
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) return;

  // Navigation requests: Network first, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Static assets: Cache-first with background network update
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
