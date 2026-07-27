// KITENGO GAMING - Service Worker
// Inaruhusu app kufunguka bila internet (offline) na kuonyesha kitufe cha "Install App"

const CACHE_NAME = "kitengo-gaming-v1";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./game.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALL: Hifadhi faili muhimu kwenye cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE: Futa cache za zamani zisizohitajika tena
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// FETCH: Tumia cache kwanza kwa faili za tovuti (app shell),
// lakini data za Firebase/Gemini ziende moja kwa moja mtandaoni (network)
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Usicache maombi ya Firebase, Gemini, au Netlify Functions - hizi zihitaji data mpya kila wakati
  if (
    url.includes("firebaseio.com") ||
    url.includes("googleapis.com") ||
    url.includes("/.netlify/functions/") ||
    url.includes("firebasedatabase.app")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          // Hifadhi nakala mpya ya faili kwenye cache kwa matumizi ya baadae bila mtandao
          if (event.request.method === "GET" && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Ikiwa hakuna mtandao na hakuna cache, rudisha index.html kama fallback
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
