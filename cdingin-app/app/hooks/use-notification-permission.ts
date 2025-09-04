import { useState, useCallback, useEffect } from "react";
import axios from "axios";

import { urlBase64ToUint8Array } from "~/common/utils";

// Define a type for the possible states of notification permission.
type PermissionState = "prompt" | "granted" | "denied";

/**
 * Hook to manage the state of notification permission and subscription.
 * @returns An object containing the current notification permission state, and functions to request permission and subscribe.
 * @example
 * const { permission, requestPermission, subscribe } = useNotificationPermission();
 * requestPermission().then(() => subscribe());
 */
export function useNotificationPermission() {
    // State to store the current notification permission status.
    const [permission, setPermission] = useState<PermissionState>("prompt");

    /**
     * State to store whether the subscription process is currently active or not.
     */
    const [isSubscribing, setIsSubscribing] = useState(false);

    // useEffect hook to check the current notification permission status when the component mounts.
    useEffect(() => {
        // Check if the Permissions API is supported by the browser.
        if (!("permissions" in navigator)) {
            // Fallback for browsers that do not support the Permissions API.
            const legacyPermission = Notification.permission;
            setPermission(
                legacyPermission === "default" ? "prompt" : legacyPermission
            );
            return;
        }
        // Asynchronous function to query the permission status.
        const checkPermission = async () => {
            // Asynchronous function to query the permission status.
            const permissionStatus = await navigator.permissions.query({
                name: "push",
                userVisibleOnly: true,
            });
            setPermission(permissionStatus.state); // Set the permission state based on the query result.
            permissionStatus.onchange = () =>
                // Update the permission state if it changes.
                setPermission(permissionStatus.state);
        };
        checkPermission();
    }, []); // Empty dependency array means this effect runs once on mount.

    // useEffect hook to automatically subscribe if permission is granted.
    useEffect(() => {
        if (permission === "granted") {
            // If permission is granted, automatically subscribe.
            subscribe();
        }
    }, [permission]); // This effect runs whenever the `permission` state changes.

    // Memoized callback function to request notification permission from the user.
    const requestPermission = useCallback(async () => {
        // Callback function to request notification permission from the user.
        await window.Notification.requestPermission();
    }, []);

    const subscribe = useCallback(async () => {
        try {
            // Start a try-catch block to handle potential errors during subscription.
            if (!("serviceWorker" in navigator)) {
                // Check if Service Workers are supported in the browser.
                // Log an error if Service Workers are not supported.
                console.error(
                    "[Push] ServiceWorker not supported in this browser."
                );
                return;
            }
            if (!("PushManager" in window)) {
                // Check if Push API is supported in the browser.
                console.error(
                    // Log an error if the Push API is not supported.
                    "[Push] PushManager not supported in this browser."
                );
                return;
            }
            if (permission !== "granted") {
                // Check if notification permission has been granted.
                console.warn(
                    "[Push] Cannot subscribe because permission is:",
                    // Warn if permission is not granted.
                    permission
                );
                return;
            }

            // Get the active service worker registration.
            const registration = await navigator.serviceWorker.ready; // Wait for the service worker to be ready.
            console.log("[Push] ServiceWorker registered:", registration); // Log the service worker registration.
            console.log("[Push] ServiceWorker ready:", registration); // Confirm service worker is ready.
            // Retrieve the VAPID public key from environment variables.
            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY; // Retrieve the VAPID public key from environment variables.
            if (!vapidKey) {
                // Check if the VAPID key is available.
                // Log an error if the VAPID public key is missing.
                console.error("[Push] Missing VITE_VAPID_PUBLIC_KEY in .env");
                return;
            }
            // Convert the VAPID key from base64 to a Uint8Array, as required by the Push API.
            const applicationServerKey = urlBase64ToUint8Array(vapidKey); // Convert the VAPID key to a Uint8Array.

            // Check if there's an existing push subscription.
            let subscription = await registration.pushManager.getSubscription(); // Get the current subscription.

            if (!subscription) {
                // If no existing subscription is found.
                // Create a new push subscription.
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true, // Indicates that the user will be shown a notification for every message.
                    applicationServerKey, // The VAPID public key used to identify the application server.
                });
                console.log("[Push] New subscription created:", subscription); // Log the newly created subscription.
            } else {
                console.log(
                    "[Push] Existing subscription found:",
                    subscription
                ); // Log if an existing subscription is found.
            }

            // Send the subscription object to the backend.
            await axios.post(
                `${import.meta.env.VITE_API_URL}/push-subscriptions`,
                subscription,
                { withCredentials: true } // Include cookies with the request.
            );
            console.log("[Push] Subscription successfully sent to backend!"); // Log success message.
        } catch (err) {
            // Catch any errors that occur during the subscription process.
            // Log the error if subscription fails.
            console.error("[Push] Failed to subscribe:", err);
        }
    }, [permission]); // The `subscribe` function depends on the `permission` state.

    // Return the permission state, and the functions to request permission, subscribe, and the subscribing status.
    return { permission, requestPermission, subscribe, isSubscribing };
}
