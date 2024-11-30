const CACHE_NAME = 'do-app-v1';
const urlsToCache = [
  '/do.html',
  '/do.css',
  '/do.js',
  '/new-task.html',
  '/new-task.js',
  '/task-details.html',
  '/task-details.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
