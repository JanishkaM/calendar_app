const SW_VERSION = 'v4';
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
      const clientsList = await self.clients.matchAll({ includeUncontrolled: true });
      clientsList.forEach(c =>
        c.postMessage({ type: 'SW_READY', version: SW_VERSION })
      );
    })()
  );
});

function isImageRequest(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico|avif)$/.test(url.pathname);
}

function isApiGet(request, url) {
  return request.method === 'GET' && url.pathname.startsWith('/api/');
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

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const resp = await fetch(request);
    if (resp.ok) cache.put(request, resp.clone());
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

async function networkFirstApi(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const resp = await fetch(request);
    // optionally only cache 200 responses
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin except maybe images/fonts/CDNs you want; keep default pass-through
  if (url.origin !== self.location.origin) return;

  // NAVIGATION requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event, request));
    return;
  }

  // NEXT build/static assets
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Optimized images endpoint (_next/image) - network first with fallback
  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Regular images
  if (isImageRequest(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // API GET
  if (isApiGet(request, url)) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  // Default: just try network, fallback to cache if exists
  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch {
        const cache = await caches.open(RUNTIME);
        const cached = await cache.match(request);
        return cached || new Response('Offline', { status: 503 });
      }
    })()
  );
});

// MESSAGE: allow skipWaiting trigger
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});