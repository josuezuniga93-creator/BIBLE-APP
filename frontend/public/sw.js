// TULIP Bible App — Service Worker v4 (no force-reload)

const CACHE_NAME = 'tulip-v4';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear old caches and claim clients — but do NOT force-navigate (that interrupts React hydration)
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Network-first: always get fresh content, never serve stale
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});
