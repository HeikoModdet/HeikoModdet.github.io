const CACHE_NAME = 'playground-v9';
const ASSETS = [
  '/',
  '/index.html',
  '/nevio-18.html',
  '/images/nevio-bike.png',
  '/images/nevio-bike-sm.png',
  '/aliya.html',
  '/robot-galaxie.html',
  '/heizkosten-oelzentralheizung.html',
  '/jahreskostenkalkulation.html',
  '/driftrace/',
  '/driftrace/index.html',
  '/yazimoo/',
  '/yazimoo/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/apple-touch-icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // cross-origin unangetastet

  // NAVIGATION (HTML-Seiten) = NETWORK-FIRST: immer neueste Version,
  // Cache nur als Offline-Fallback. Verhindert alte Seiten im Cache.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return resp;
      }).catch(() =>
        caches.match(request).then(cached => cached || caches.match('/index.html'))
      )
    );
    return;
  }

  // STATIC ASSETS (Bilder, Icons, Manifest) = CACHE-FIRST fuer Geschwindigkeit
  e.respondWith(
    caches.match(request).then(cached => {
      const fetched = fetch(request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
