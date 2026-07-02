// Service Worker for Magic Portfolio Push Notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notification
self.addEventListener("push", (event) => {
  console.log("Service Worker: Menerima event push!");
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
      console.log("Service Worker: Payload JSON berhasil di-parse:", data);
    } catch (e) {
      const txt = event.data.text();
      data = { title: "Magic Portfolio", body: txt };
      console.log("Service Worker: Payload teks biasa:", txt);
    }
  }

  const title = data.title || "Magic Portfolio Notification";
  const options = {
    body: data.body || "Anda memiliki notifikasi baru dari Magic Portfolio.",
    icon: data.icon || "/images/avatar.jpg",
    badge: data.badge || "/favicon.ico",
    tag: data.tag || "magic-portfolio-notification",
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || "/guestbook",
    },
    actions: [
      { action: "open", title: "Buka Portfolio" },
      { action: "dismiss", title: "Tutup" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Navigate or focus on notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = (event.notification.data && event.notification.data.url) || "/guestbook";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client && client.url.includes(targetUrl) === false) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
