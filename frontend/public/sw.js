// Cache public reading screens and their assets. Account/API writes are never cached.
const SHELL_CACHE = 'tulip-shell-v9';
const ASSET_CACHE = 'tulip-assets-v9';
const CONTENT_CACHE = 'tulip-content-v1';
const OFFLINE_URL = '/offline.html';
const PUBLIC_SCREENS = new Set(['/', '/lexicon', '/notes', '/library', '/learn', '/family-worship', '/more', '/bible-tracker', '/bible-plans', '/study-tools', '/timeline']);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => (key.startsWith('bible-') || key.startsWith('tulip-shell-') || key.startsWith('tulip-assets-')) && ![SHELL_CACHE, ASSET_CACHE].includes(key))
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

async function saveResponse(cacheName, key, response, maxEntries) {
  if (!response.ok || response.type === 'opaque') return;
  const cache = await caches.open(cacheName);
  await cache.put(key, response.clone());
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map(item => cache.delete(item)));
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const publicScreen = PUBLIC_SCREENS.has(url.pathname) || /^\/library\/[^/]+$/.test(url.pathname);

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (publicScreen && response.ok) {
          event.waitUntil(saveResponse(SHELL_CACHE, request, response.clone(), 35).catch(() => {}));
        }
        return response;
      } catch {
        const cache = await caches.open(SHELL_CACHE);
        return (publicScreen && await cache.match(request)) || await cache.match(OFFLINE_URL);
      }
    })());
    return;
  }

  const asset = url.pathname.startsWith('/_next/static/') || /\.(?:woff2|png|webp|jpg|jpeg|svg)$/.test(url.pathname);
  const content = /^\/api\/books(?:\/[^/]+(?:\/chapter\/\d+)?)?$/.test(url.pathname) || url.pathname === '/api/devotional';
  if (!asset && !content) return;
  const cacheName = asset ? ASSET_CACHE : CONTENT_CACHE;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    if (asset) {
      const cached = await cache.match(request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok) event.waitUntil(saveResponse(cacheName, request, response.clone(), asset ? 180 : 40).catch(() => {}));
      return response;
    } catch {
      const cached = await cache.match(request);
      return cached || new Response(JSON.stringify({ error: 'This reading has not been saved on this device yet.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
  })());
});
