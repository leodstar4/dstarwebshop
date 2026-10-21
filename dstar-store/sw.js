const VERSION = 'dstar-v13';
const SHELL = `${VERSION}-shell`;
const IMAGES = `${VERSION}-img`;
const MAX_IMAGES = 80;

const PRECACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/style.css',
  '/js/products-data.js',
  '/js/cart-store.js',
  '/js/app.js',
  '/js/loader.js',
  '/js/gsap-animations.js',
  '/js/blog-transitions.js',
  '/assets/brand/logo-120.webp?v=2',
  '/assets/brand/logo-240.webp?v=2',
  '/assets/brand/logo-480.webp?v=2',
  '/assets/brand/favicon-32.png?v=2'
];

const NEVER_CACHE = [/^\/\.netlify\//, /^\/api\//, /^\/checkout/, /^\/gracias/, /^\/error-pago/, /^\/pago-pendiente/, /^\/pedidos/, /^\/seguimiento/, /^\/sw\.js$/, /\.mp4$/];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(SHELL);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') return cache.match('/offline.html');
    throw new Error('offline');
  }
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function cacheFirst(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  let response;
  try {
    const accept = request.headers.get('accept');
    response = await fetch(request.url, { mode: 'cors', credentials: 'omit', headers: accept ? { accept } : {} });
  } catch {
    return fetch(request);
  }
  if (response.ok) {
    cache.put(request, response.clone()).then(() => (max ? trim(cacheName, max) : null)).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (NEVER_CACHE.some((re) => re.test(url.pathname))) return;
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.hostname === 'res.cloudinary.com' && request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGES, MAX_IMAGES));
  }
});
