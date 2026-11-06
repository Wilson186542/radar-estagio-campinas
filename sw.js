const CACHE_NAME = "radar-estagio-v4";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./src/css/style.css?v=4",
  "./src/js/app.js?v=4",
  "./data/transit_data.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Nunca fazer cache das chamadas em tempo real da API do Cittamobi
  if (url.hostname.includes("cittamobi.com.br") || url.pathname.includes("/api/realtime")) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
