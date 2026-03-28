const CACHE_NAME = "discount-pwa-v4";
const FILES_TO_CACHE = ["index.html", "app.js", "style.css", "manifest.json"];

console.log("[SW] Service worker установлен!");

self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evt) => {
  const url = new URL(evt.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAppShellAsset = FILES_TO_CACHE.some((file) => url.pathname.endsWith(file));

  if (isSameOrigin && isAppShellAsset) {
    evt.respondWith(
      fetch(evt.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(evt.request))
    );
    return;
  }

  evt.respondWith(caches.match(evt.request).then((response) => response || fetch(evt.request)));
});
