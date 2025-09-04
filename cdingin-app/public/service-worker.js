/// <reference lib="webworker" />

// const {
//     cleanupOutdatedCaches,
//     precacheAndRoute,
// } = require("workbox-precaching");

// // declare const self: ServiceWorkerGlobalScope;
// cleanupOutdatedCaches();

// // This is the injection point for the precache manifest
// precacheAndRoute(self.__WB_MANIFEST);
// self.__WB_MANIFEST;

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
    };
    // Wait until the notification is shown before the service worker goes back to sleep.
    event.waitUntil(self.registration.showNotification(title, options));
});

// Notification handle click
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    // Open specific URL when notification clicked
    event.waitUntil(clients.openWindow("/notifications"));
});
