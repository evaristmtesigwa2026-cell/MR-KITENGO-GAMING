const CACHE_NAME = 'kitengo-gaming-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './game.js',
  './yutong2.jpg',
  './logo.jpg'
];

// Inapakia na kuhifadhi faili zote muhimu pale app inapoingia kwa mara ya kwanza
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('PWA: Inahifadhi faili muhimu offline...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Inafuta kumbukumbu za kache za zamani kama utafanya maboresho
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('PWA: Inafuta kache zilizopitwa na wakati...');
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Logic ya kuruhusu app kufanya kazi offline kwa kuvuta faili zilizohifadhiwa
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
