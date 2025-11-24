import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST || [])
cleanupOutdatedCaches()

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  if (url.pathname.startsWith('/_nuxt/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.open('static-v1').then(async (cache) => {
        const cached = await cache.match(req)
        if (cached) return cached

        const resp = await fetch(req)
        cache.put(req, resp.clone())
        return resp
      }),
    )
  }

})
