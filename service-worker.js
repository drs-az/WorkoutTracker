self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('workout-cache-v1').then(cache => {
      return cache.addAll([
        'index.html',
        'style.css',
        'app.js',
        'manifest.json',
        '185-1851780_cartman-beefcake-eric-cartman-beefcake.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
