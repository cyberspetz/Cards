// ===== SustainMind Service Worker =====
// Version-based caching with lazy image loading

const CACHE_VERSION = 'v3';
const SHELL_CACHE = `sm-shell-${CACHE_VERSION}`;
const IMAGE_CACHE = `sm-images-${CACHE_VERSION}`;

// Shell assets — small, cached on install
const SHELL_ASSETS = [
    './',
    'index.html',
    'style.css',
    'app.js',
    'manifest.json',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-180.png',
    'icons/favicon.svg',
    'icons/favicon.ico',
    'icons/favicon-48x48.png',
    'icons/apple-touch-icon.png'
];

// ===== Install: cache shell only =====
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(SHELL_CACHE).then(cache => {
            return cache.addAll(SHELL_ASSETS);
        })
    );
    // Activate immediately, don't wait for old tabs to close
    self.skipWaiting();
});

// ===== Activate: clean old caches =====
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== SHELL_CACHE && key !== IMAGE_CACHE)
                    .map(key => caches.delete(key))
            );
        }).then(() => {
            // Take control of all open tabs immediately
            return self.clients.claim();
        })
    );
});

// ===== Fetch: cache-first for shell, lazy-cache for images =====
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) return;

    // Card images: cache-first, lazy-cache on first fetch
    if (url.pathname.includes('/cards/')) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then(cache => {
                return cache.match(event.request).then(cached => {
                    if (cached) return cached;

                    // Not cached yet — fetch from network and cache for next time
                    return fetch(event.request).then(response => {
                        if (response.ok) {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    });
                });
            })
        );
        return;
    }

    // Shell assets: cache-first, fall back to network
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request);
        })
    );
});
