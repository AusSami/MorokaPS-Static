const CACHE_NAME = 'moroka-static-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/scripts/site.js',
  '/favicon.svg',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).then(fetchResp => {
      // optionally cache dynamic requests
      return fetchResp;
    })).catch(() => caches.match('/index.html'))
  );
});