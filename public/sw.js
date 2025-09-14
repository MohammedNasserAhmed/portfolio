// Bumped VERSION to v6 to flush prior caches and prevent stale 404 image caching
const VERSION = 'v6';
const STATIC_CACHE = `portfolio-static-${VERSION}`;
const RUNTIME_CACHE = `portfolio-runtime-${VERSION}`;
const IMAGE_CACHE = `portfolio-images-${VERSION}`;

// Derive the base path from the registration scope so this works on both
// GitHub Pages ("/portfolio/") and Vercel root ("/")
const SCOPE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const BASE = SCOPE_PATH === '' ? '' : SCOPE_PATH; // e.g., '' or '/portfolio'
const OFFLINE_URL = `${BASE}/offline.html`;

// Keep CORE_ASSETS minimal and avoid fingerprinted assets that change each build
const CORE_ASSETS = [
    `${BASE}/`,
    `${BASE}/index.html`,
    `${BASE}/ar/index.html`,
    OFFLINE_URL,
    `${BASE}/data/content.json`,
    `${BASE}/data/content.ar.json`,
    `${BASE}/images/website-photo.png`,
    `${BASE}/manifest.webmanifest`
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

    // Skip non-HTTP(S) schemes (e.g., chrome-extension://, moz-extension://)
    try {
        const url = new URL(request.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return; // don't intercept
        }

        // Always bypass caching for API calls
        if (url.pathname.startsWith(`${BASE}/api/`) || url.pathname.startsWith('/api/')) {
            event.respondWith(fetch(request));
            return;
        }
    } catch (_e) {
        // If URL parsing fails, do not intercept
        return;
    }

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

    // Bypass caching for versioned JSON (content updates) – always network-first
    if (/content\.json\?v=/.test(request.url) || /content\.ar\.json\?v=/.test(request.url)) {
        event.respondWith(fetch(request).catch(() => caches.match(request.url.split('?')[0])));
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

    // Images: Cache-first with limit; only cache successful responses
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached && cached.ok) return cached;
                return fetch(request)
                    .then((resp) => {
                        if (resp && resp.ok) {
                            const copy = resp.clone();
                            caches.open(IMAGE_CACHE).then((cache) => {
                                cache.put(request, copy);
                                // Optional cleanup
                                cache.keys().then((keys) => {
                                    if (keys.length > 60) cache.delete(keys[0]);
                                });
                            });
                            return resp;
                        }
                        // Non-OK HTTP (e.g., 404): fallback placeholder
                        return caches.match(`${BASE}/images/website-photo.png`);
                    })
                    .catch(() => caches.match(`${BASE}/images/website-photo.png`));
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
