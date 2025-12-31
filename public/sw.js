const SW_VERSION = 'v5';
const PRECACHE = `precache-${SW_VERSION}`;
const RUNTIME = `runtime-${SW_VERSION}`;

const PRECACHE_URLS = [
  '/offline.html'
];

// INSTALL: precache core
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

// ACTIVATE: cleanup old + enable navigation preload
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        if (self.registration.navigationPreload) {
          await self.registration.navigationPreload.enable();
        }
      } catch {}
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(k => ![PRECACHE, RUNTIME].includes(k))
          .map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// --- HELPER FUNCTIONS ---

function isImageRequest(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico|avif)$/.test(url.pathname);
}

function isApiGet(request, url) {
  return request.method === 'GET' && url.pathname.startsWith('/api/');
}

// Check if the request is for Supabase Auth
function isAuthRequest(url) {
  return (
    url.pathname.startsWith('/auth/') || 
    url.search.includes('code=') || 
    url.search.includes('access_token=') ||
    url.hash.includes('access_token=')
  );
}

async function handleNavigation(event, request) {
  try {
    const preload = await event.preloadResponse;
    if (preload) return preload;

    const networkResp = await fetch(request);
    if (networkResp.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, networkResp.clone());
    }
    return networkResp;
  } catch {
    const precache = await caches.open(PRECACHE);
    const offline = await precache.match('/offline.html');
    return offline || new Response('Offline', { status: 503 });
  }
}

// --- FETCH STRATEGIES ---

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const resp = await fetch(request);
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  } catch {
    return cached || new Response('', { status: 504 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(resp => {
      if (resp && resp.ok) cache.put(request, resp.clone());
      return resp;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// --- MAIN FETCH LISTENER ---

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. CRITICAL BYPASS: Do not handle Auth or Cross-Origin requests
  if (isAuthRequest(url) || url.origin !== self.location.origin) {
    return; // Let the browser handle these normally
  }

  if (request.method !== 'GET') return;

  // 2. NAVIGATION requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event, request));
    return;
  }

  // 3. STATIC ASSETS (Framework specific)
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 4. IMAGES
  if (isImageRequest(url) || url.pathname.startsWith('/_next/image')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 5. API GET
  if (isApiGet(request, url)) {
    event.respondWith(fetch(request)); // Better to not cache API auth calls
    return;
  }

  // 6. DEFAULT: Network first, fallback to cache
  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch {
        const cache = await caches.open(RUNTIME);
        return await cache.match(request) || new Response('Offline', { status: 503 });
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});