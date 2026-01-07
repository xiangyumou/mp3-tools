/* global self, caches, fetch, URL, console */

// Service Worker for FFmpeg WASM caching
// This SW caches large FFmpeg resources for faster subsequent loads

const CACHE_NAME = 'ffmpeg-cache-v1';
const FFMPEG_ASSETS = [
    '/ffmpeg/ffmpeg-core.js',
    '/ffmpeg/ffmpeg-core.wasm'
];

// Install event - precache FFmpeg assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching FFmpeg assets');
                return cache.addAll(FFMPEG_ASSETS);
            })
            .then(() => {
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - Cache First strategy for FFmpeg assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle FFmpeg assets with Cache First strategy
    if (url.pathname.startsWith('/ffmpeg/')) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[SW] Serving from cache:', url.pathname);
                        return cachedResponse;
                    }

                    console.log('[SW] Fetching and caching:', url.pathname);
                    return fetch(event.request).then((networkResponse) => {
                        // Clone the response before caching
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                        return networkResponse;
                    });
                })
        );
    }
});
