// Service Worker for PWA functionality
const CACHE_NAME = 'stitch-please-v1';
const urlsToCache = [
  '/',
  '/shop',
  '/services',
  '/about',
  '/manifest.json',
  '/favicon.ico',
  '/Logo.png',
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.error('Service worker install failed:', err))
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch((err) => {
        console.error('Service worker fetch failed:', err);
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .catch((err) => console.error('Service worker activation failed:', err))
  );
});
