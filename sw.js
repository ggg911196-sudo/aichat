/* Service Worker — کار آفلاین + همیشه به‌روز
   نسخه با هر انتشار بالا می‌رود تا کش قدیمی خودکار پاک شود. */
const VER   = 'v4';
const CACHE = 'aichat-' + VER;

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

/* نصب: فایل‌ها را تازه از شبکه بگیر، نه از کش مرورگر */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(
        ASSETS.map(u =>
          fetch(new Request(u, { cache: 'reload' }))
            .then(r => (r && r.ok) ? c.put(u, r) : null)
            .catch(() => null)
        )
      ))
      .then(() => self.skipWaiting())
  );
});

/* فعال‌سازی: همه کش‌های نسخه‌های قبلی پاک شوند */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* اگر صفحه پیام skipWaiting بفرستد، فوراً نسخه جدید فعال شود */
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  /* API و سرویس‌های بیرونی هرگز کش نشوند */
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('workers.dev') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('groq.com') ||
      url.hostname.includes('pollinations')) {
    return;
  }

  /* فقط دامنه خودمان */
  if (url.origin !== self.location.origin) return;

  const isPage = req.mode === 'navigate' ||
                 url.pathname === '/' ||
                 url.pathname.endsWith('.html');

  e.respondWith(
    /* cache:'reload' یعنی کش HTTP مرورگر دور زده شود و واقعاً از سرور بخوانَد */
    fetch(isPage ? new Request(req.url, { cache: 'reload', credentials: 'same-origin' }) : req)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      /* آفلاین: از کش بده */
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
