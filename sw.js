const VERSION = 'v2';
const STATIC_CACHE = `portfolio-static-${VERSION}`;
const RUNTIME_CACHE = 'portfolio-runtime';
const IMAGE_CACHE = 'portfolio-images';
const OFFLINE_URL = '/portfolio/offline.html';

const CORE_ASSETS = [
    '/portfolio/',
    '/portfolio/index.html',
    '/portfolio/ar/index.html',
    '/portfolio/offline.html',
    '/portfolio/dist/style.css',
    '/portfolio/js/main.js',
    '/portfolio/images/website-photo.png',
    '/portfolio/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(k))
                        .map((k) => caches.delete(k))
                )
            )
            .then(() => self.clients.claim())
    );
});

function isHTML(request) {
    return (
        request.destination === 'document' ||
        (request.headers.get('accept') || '').includes('text/html')
    );
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    // HTML: Network-first with offline fallback
    if (isHTML(request)) {
        event.respondWith(
            fetch(request)
                .then((resp) => {
                    const copy = resp.clone();
                    caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
                    return resp;
                })
                .catch(() => caches.match(request).then((c) => c || caches.match(OFFLINE_URL)))
        );
        return;
    }

    // CSS/JS: Stale-while-revalidate
    if (request.destination === 'style' || request.destination === 'script') {
        event.respondWith(
            caches.match(request).then((cached) => {
                const fetchPromise = fetch(request)
                    .then((resp) => {
                        if (resp && resp.status === 200) {
                            const copy = resp.clone();
                            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
                        }
                        return resp;
                    })
                    .catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    // Images: Cache-first with limit
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request)
                    .then((resp) => {
                        const copy = resp.clone();
                        caches.open(IMAGE_CACHE).then((cache) => {
                            cache.put(request, copy);
                            // Optional cleanup
                            cache.keys().then((keys) => {
                                if (keys.length > 40) cache.delete(keys[0]);
                            });
                        });
                        return resp;
                    })
                    .catch(() => caches.match('/portfolio/images/website-photo.png'));
            })
        );
        return;
    }

    // Default: try cache then network
    event.respondWith(
        caches
            .match(request)
            .then(
                (cached) =>
                    cached ||
                    fetch(request).catch(() =>
                        request.mode === 'navigate' ? caches.match(OFFLINE_URL) : cached
                    )
            )
    );
});
