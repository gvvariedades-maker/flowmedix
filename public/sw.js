self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/** Pass-through: requisito mínimo de installability no Chrome; conteúdo continua online. */
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
