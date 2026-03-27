const CACHE_NAME = 'moments-v6';
const ASSETS = [
  './',
  './index.html',
  './css/theme.css',
  './js/app.js',
  './js/store.js',
  './js/data.js',
  './js/router.js',
  './js/components/Header.js',
  './js/components/WelcomeScreen.js',
  './js/components/CodeEntry.js',
  './js/components/CardViewer.js',
  './js/components/PrivateVault.js',
  './js/components/MyCodesManager.js',
  './js/components/GiftCreator.js',
  './js/components/RecipientPicker.js',
  './js/components/MessageEditor.js',
  './js/components/InviteShare.js',
  './js/components/CodeReveal.js',
  './js/components/ContributePage.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: always try fresh files, fall back to cache offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
