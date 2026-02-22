self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Estratégia simples de cache ou apenas passar direto
  e.respondWith(fetch(e.request));
});
