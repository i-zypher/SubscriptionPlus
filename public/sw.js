// Subscription Plus service worker. Deliberately caches nothing but the
// offline page and its logo, so every deploy shows up immediately, in the
// browser and in the Android app alike.
const OFFLINE = "offline.html";
const LOGO = "app/icon-192.png";
const CACHE = "sp-offline-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE, LOGO])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

// Pages come from the network; only when that fails do we show the offline page
self.addEventListener("fetch", (event) => {
  if (event.request.url.endsWith(LOGO)) {
    event.respondWith(fetch(event.request).catch(() => caches.match(LOGO)));
    return;
  }
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE, { ignoreSearch: true })),
  );
});
