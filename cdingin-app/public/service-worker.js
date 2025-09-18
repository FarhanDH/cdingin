/// <reference lib="webworker" />
try {
    importScripts(
        "https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js"
    );
} catch (e) {
    console.error("Workbox gagal dimuat", e);
}

if (self.workbox) {
    const { precaching, routing, strategies } = self.workbox;

    console.log(`Workbox berhasil dimuat!`);

    precaching.cleanupOutdatedCaches();
    precaching.precacheAndRoute(self.__WB_MANIFEST || []);

    // --- PERBAIKAN UTAMA DI SINI ---
    // Buat strategi cache-first untuk navigasi.
    // Ini akan mencoba mengambil dari cache dulu, lalu jaringan.
    // 'app-shell' adalah nama cache yang umum untuk ini.
    const navigationStrategy = new strategies.CacheFirst({
        cacheName: "app-shell",
    });

    // Daftarkan rute baru KHUSUS untuk permintaan navigasi.
    routing.registerRoute(
        // Kondisi: Jalankan aturan ini jika 'request.mode' adalah 'navigate'.
        // Ini adalah cara Workbox untuk mengidentifikasi saat pengguna mencoba
        // membuka halaman baru (bukan saat meminta gambar atau API).
        ({ request }) => request.mode === "navigate",

        // Handler: Jika kondisinya cocok, gunakan strategi yang sudah kita buat.
        async (args) => {
            try {
                // Coba layani dari cache/jaringan seperti biasa.
                return await navigationStrategy.handle(args);
            } catch (error) {
                // JARING PENGAMAN: Jika gagal (misalnya, offline dan halaman belum di-cache),
                // SELALU kembalikan 'index.html' yang sudah di-precache.
                // Ganti "/index.html" dengan "/" karena Workbox sekarang mengidentifikasi
                // halaman utama dengan URL root.
                return precaching.matchPrecache("/");
            }
        }
    );
    // ---------------------------------
} else {
    console.log(`Workbox gagal dimuat!`);
}

self.addEventListener("install", (event) => {
    console.log("Service Worker installing.");
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activated.");
});

self.addEventListener("fetch", (event) => {});

// Listen for the 'push' event, which is triggered when a notification arrives from the server.
self.addEventListener("push", (event) => {
    if (!event.data) return;
    // The data sent from the backend is in event.data.
    // JSON string with title, body, etc.
    const data = event.data.json();
    const title = data.title || "cdingin";
    const options = {
        body: data.body,
        icon: "/web-app-manifest-192x192.png",
        badge: "/badge-72x72.png",
        vibrate: [200, 100, 200],
        tag: data.tag,
        renotify: true,
        data: {
            link: data.link || "/",
            notificationId: data.notificationId,
        },
    };
    // Wait until the notification is shown before the service worker goes back to sleep.
    event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Listen for the 'notificationclick' event, which is triggered when the user clicks on a notification.
 */
self.addEventListener("notificationclick", (event) => {
    /**
     * Close the notification after the user clicks on it.
     */
    event.notification.close();

    /**
     * Get the link associated with the notification.
     */
    const link = event.notification.data.link;

    /**
     * Get all window clients associated with the service worker.
     */
    const promiseChain = self.clients
        .matchAll({
            type: "window",
            includeUncontrolled: true,
        })
        .then((windowClients) => {
            /**
             * Find a matching window client with the same URL as the notification link.
             */
            let matchingClient = null;

            for (const client of windowClients) {
                /**
                 * Get the URL of the current client, removing the trailing slash if present.
                 */
                const clientUrl = client.url.endsWith("/")
                    ? client.url.slice(0, -1)
                    : client.url;
                /**
                 * Get the URL of the notification link, removing the trailing slash if present.
                 */
                const linkUrl = new URL(
                    link,
                    self.location.origin
                ).href.endsWith("/")
                    ? new URL(link, self.location.origin).href.slice(0, -1)
                    : new URL(link, self.location.origin).href;

                /**
                 * If a matching client is found, focus it and break out of the loop.
                 */
                if (clientUrl === linkUrl) {
                    matchingClient = client;
                    break;
                }
            }

            /**
             * If a matching client is found, focus it. Otherwise, open a new window with the notification link.
             */
            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return self.clients.openWindow(link);
            }
        });

    /**
     * Wait until the promise chain is resolved.
     */
    event.waitUntil(promiseChain);
});
