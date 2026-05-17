// TULIP Bible App — Service Worker v3 (cache-bust)

const CACHE_NAME = 'tulip-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ type: 'window' }).then((clients) =>
          clients.forEach((client) => client.navigate(client.url))
        )
      )
  );
});

// Network-first: always get fresh content, never serve stale
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});
