/* Service Worker — کار آفلاین و بارگذاری سریع */
const CACHE = 'aichat-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;

  /* فقط GET کش می‌شود */
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* درخواست‌های API هرگز کش نشوند */
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('workers.dev') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('groq.com') ||
      url.hostname.includes('pollinations')) {
    return;
  }

  /* شبکه اول، در نبود شبکه از کش */
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
