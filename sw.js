// KITENGO GAMING - Advanced Progressive Web App Service Worker
const CACHE_NAME = "kitengo-gaming-v2";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./game.js",
  "./manifest.json",
  "./logo.jpg",
  "./yutong2.jpg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALL: Hifadhi rasilimali zote za msingi kwenye Cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE: Futa cache zote za zamani zisizotumika
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH: Mbinu ya Stale-While-Revalidate kwa matumizi ya haraka sana Offline na Online
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Ruka maombi yote yanayoenda Firebase au Google API ili yawe ya papo kwa papo
  if (
    url.includes("firebaseio.com") ||
    url.includes("googleapis.com") ||
    url.includes("firebasedatabase.app") ||
    url.includes("/.netlify/functions/")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: "Offline mode active for database" }), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // Mfumo wa Stale-While-Revalidate kwa Static Assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            event.request.method === "GET" &&
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
