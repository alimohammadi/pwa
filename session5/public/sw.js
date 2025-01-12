self.addEventListener("install", function (event) {
  // console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open("static").then((cache) => {
      console.log("[Service Worker] Precashing service worker");

      cache.add("/");
      cache.add("/index.html");
      cache.add("/src/js/app.js");
    })
  );
});

self.addEventListener("activate", function (event) {
  // console.log('[Service Worker] Activating Service Worker ....', event);
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  // console.log('[Service Worker] Fetching something ....', event);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      } else return fetch(event.request);
    })
  );
});
