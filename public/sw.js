const CACHE_NAME = 'snapnotes-v2';
const urlsToCache = [
  '/',
  '/index.html'
];

// Install event - cache important assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        // Try to cache URLs, but don't fail if some don't exist
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('[Service Worker] Some files could not be cached:', error);
          // Cache individual files that succeed
          return Promise.all(
            urlsToCache.map(url => 
              cache.add(url).catch(err => {
                console.warn(`[Service Worker] Failed to cache ${url}:`, err);
              })
            )
          );
        });
      })
      .catch((error) => {
        console.error('[Service Worker] Cache open failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip external API calls (Supabase, R2, etc) - NEVER CACHE THESE!
  if (
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('cloudflarestorage.com') ||
    event.request.url.includes('r2.dev') ||
    event.request.url.includes('pub-e36e43af5c9d4f638f2df410398fbe12.r2.dev')
  ) {
    // Pass through to network directly, no caching
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the new response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Network failed, return offline page if available
          return caches.match('/index.html');
        });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
