self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("discount-pwa-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/app.js",
        "/manifest.json",
        "/icons/icon-192.png",
        "/icons/icon-512.png",
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
