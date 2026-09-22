// EduNova Pro PWA Service Worker
const CACHE_NAME = "edunova-pro-v1";
const STATIC_ASSETS = ["/", "/favicon.ico", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.reduce((acc, key) => {
          if (key !== CACHE_NAME) acc.push(caches.delete(key));
          return acc;
        }, [])
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Solo aplicar network-first para peticiones GET que no sean Server Actions ni API
  if (
    event.request.method === "GET" &&
    !event.request.url.includes("/api/") &&
    !event.request.headers.get("next-action")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((res) => {
          return res || caches.match("/");
        });
      })
    );
  }
});
