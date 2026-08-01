// ==========================================
// KITENGO GAMING - SERVICE WORKER (PWA)
// ==========================================
// Badilisha namba hii (v1, v2, v3...) kila unapofanya
// mabadiliko makubwa ya code, ili simu za watumiaji
// zipate update mpya badala ya kubaki na cache ya zamani.
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'kitengo-gaming-' + CACHE_VERSION;

// Faili za msingi zinazohitajika ili app ifunguke bila internet
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './game.js',
  './logo.jpg',
  './yutong2.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/maskable-icon-512.png'
];

// Majina ya host ambazo ni data za "live" (Firebase, Gemini AI n.k)
// Hizi HAZITAHIFADHIWA offline kwa sababu ni data inayobadilika kila wakati.
const NETWORK_ONLY_HOSTS = [
  'firebaseio.com',
  'firebasedatabase.app',
  'googleapis.com',
  'gstatic.com',
  'firebaseapp.com'
];

// ---------- INSTALL: hifadhi faili za msingi ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll ikishindwa kwa faili moja (mfano logo.jpg haipo bado),
      // tunajaribu moja moja ili zisizoshindwa ziendelee kuhifadhiwa.
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Imeshindwa kuhifadhi:', url, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ---------- ACTIVATE: futa cache za zamani ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('kitengo-gaming-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ---------- FETCH: mkakati wa caching ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Ruka requests zisizo GET (POST kwenda Firebase n.k)
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1) Data za "live" (Firebase/Gemini) -> nenda mtandaoni tu, usihifadhi.
  //    Zikishindikana bila internet, app itaonyesha error ya kawaida
  //    badala ya data ya zamani/ya uongo.
  if (NETWORK_ONLY_HOSTS.some((host) => url.hostname.includes(host))) {
    event.respondWith(fetch(req).catch(() => new Response(
      JSON.stringify({ error: 'offline' }),
      { headers: { 'Content-Type': 'application/json' } }
    )));
    return;
  }

  // 2) Kwa kurasa (navigation) -> jaribu network kwanza, ukikosa internet
  //    rudisha index.html iliyohifadhiwa (ili app ifunguke offline).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 3) Assets nyingine za site yako mwenyewe (CSS/JS/picha/fonts) ->
  //    Cache-first: onyesha ya kwenye cache mara moja (haraka + offline),
  //    kisha kwa nyuma pakua mpya kutoka mtandaoni na uihifadhi (stale-while-revalidate).
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      }).catch(() => cached); // offline na haipo cache -> hakuna cha kufanya

      return cached || networkFetch;
    })
  );
});
