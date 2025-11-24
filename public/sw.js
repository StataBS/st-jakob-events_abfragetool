// Standard Vite PWA injectManifest placeholder – the plugin
// will inject precache manifest into self.__WB_MANIFEST
self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });
  
  // Optional: basic runtime caching for static assets (CSS/JS/images)
  // but **no navigation fallback** at all – let Nuxt handle routing.
  self.addEventListener('fetch', (event) => {
    const req = event.request;
  
    // Only care about GETs
    if (req.method !== 'GET') return;
  
    // Example: cache-first for static assets
    const url = new URL(req.url);
    if (url.pathname.startsWith('/_nuxt/') || url.pathname.startsWith('/icons/')) {
      event.respondWith(
        caches.open('static-v1').then(async (cache) => {
          const cached = await cache.match(req);
          if (cached) return cached;
  
          const resp = await fetch(req);
          cache.put(req, resp.clone());
          return resp;
        }),
      );
    }
  
    // Everything else just goes to the network → Nuxt handles routing
  });
  