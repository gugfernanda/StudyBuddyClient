console.log('[SW] Fișierul sw.js tocmai a fost încărcat');

self.addEventListener('install', e => {
  console.log('[SW] eveniment install');
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('[SW] eveniment activate');
  clients.claim();
});

self.addEventListener('push', event => {
  console.log('[SW] Am primit push:', event);

  if (event.data) {
    console.log('[SW] Payload brut:', event.data.text());
  }

  const data = event.data ? event.data.json() : {};
  console.log('[SW] Payload.parsat:', data);

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Fără titlu',
      { body: data.body || 'Fără corp' }
    )
  );
});
