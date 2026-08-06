// Service worker tối giản để ShopHub Shipper có thể cài đặt như PWA (Session 16 - Yêu cầu nâng cao 3).
// Chỉ cache "app shell" cơ bản, mọi request khác (API, ảnh sản phẩm...) đi thẳng qua network.

const CACHE_NAME = 'shophub-shipper-v1';
// Chỉ cache asset tĩnh (không cache '/' vì index.html được Vite dev-server biên dịch động)
const APP_SHELL = ['/favicon.svg', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Chỉ can thiệp GET cùng-origin cho app shell; API/backend luôn đi network trực tiếp
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
