/* =========================================
   Workly – Service Worker
   ========================================= */

const CACHE_NAME = 'workly-v6';

const ASSETS = [
    '/',
    '/index.php',
    '/assets/css/bootstrap.min.css',
    '/assets/css/bootstrap.rtl.min.css',
    '/assets/css/all.min.css',
    '/assets/css/app.css',
    '/assets/js/jquery.min.js',
    '/assets/js/bootstrap.bundle.min.js',
    '/assets/js/app.js',
    '/assets/webfonts/fa-solid-900.woff2',
    '/assets/webfonts/fa-regular-400.woff2',
    '/assets/webfonts/fa-brands-400.woff2'
];

/* Install: cache all assets */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

/* Activate: remove old caches */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

/* Fetch: cache-first strategy */
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});
