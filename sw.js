const CACHE_NAME = 'portfolio-cache-v1';
const CORE_ASSETS = [
    '/',
    '/portfolio/',
    '/portfolio/index.html',
    '/portfolio/dist/style.css',
    '/portfolio/js/main.js',
    '/portfolio/images/website-photo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return; // ignore non-GET
    event.respondWith(
        caches.match(request).then(
            (cached) =>
                cached ||
                fetch(request)
                    .then((resp) => {
                        const copy = resp.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                        return resp;
                    })
                    .catch(() => cached)
        )
    );
});
