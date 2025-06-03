import axios from 'axios';

export function initPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  navigator.serviceWorker.register('/sw.js')
    .then(reg => Promise.all([reg, Notification.requestPermission()]))
    .then(([reg, permission]) => {
      if (permission !== 'granted') throw new Error('Permisiune refuzată');
      return axios.get('http://localhost:8080/push/vapidKey')
        .then(res => {
          const vapidKey = res.data;
          return reg.pushManager.getSubscription().then(existing => {
            if (existing) return existing;
            return reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });
          });
        });
    })
    .then(sub => axios.post(
      'http://localhost:8080/push/subscribe',
      sub.toJSON(),
      { headers: { 'Content-Type': 'application/json' } }
    ))
    .catch(err => console.error('Push subscription error:', err));
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}
