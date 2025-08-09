const CACHE_VERSION = 'v3'; // Increment this on every deploy
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${CACHE_VERSION}`;

// List of static assets to cache
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html' // Optional fallback page
];

// Install SW and pre-cache static assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[ServiceWorker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate SW and remove old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("push", (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: "/icons/badge-72x72.png",
      vibrate: [200, 100, 200], // alarm-like vibration
      requireInteraction: true // stays until dismissed
    })
  );
});


// Fetch strategy
self.addEventListener('fetch', event => {
  const { request } = event;

  // 1️⃣ HTML: Network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Save latest HTML to dynamic cache
          const copy = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => {
          // Fallback to cached HTML or offline page
          return caches.match(request) || caches.match('/offline.html');
        })
    );
    return;
  }

  // 2️⃣ Static assets: Cache-first strategy
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(networkRes => {
          const copy = networkRes.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
          return networkRes;
        });
      })
    );
    return;
  }

  // 3️⃣ Other requests (API calls, etc.): Network-first with fallback
  event.respondWith(
    fetch(request)
      .then(networkRes => {
        const copy = networkRes.clone();
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, copy));
        return networkRes;
      })
      .catch(() => caches.match(request))
  );
});
