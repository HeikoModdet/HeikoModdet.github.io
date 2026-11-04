const CACHE_NAME = 'playground-v8';
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
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
