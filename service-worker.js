/* SCRIB MedNet Go — service worker (cache-first app shell) */
var CACHE = "mednet-go-v1.1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS).catch(function(){}); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (resp) {
        return resp;
      }).catch(function () {
        // hors-ligne : pour une navigation, renvoyer l'app shell
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
