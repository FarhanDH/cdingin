import axios from "axios";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { urlBase64ToUint8Array } from "~/common/utils";

import type { AuthContextType } from "~/types/auth.type";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // const subscribeToNotifications = useCallback(async () => {
    //     // Is browser support service worker and push manager
    //     if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    //         console.warn("Push messaging is not supported");
    //         return;
    //     }

    //     try {
    //         //   Request notification permission from user
    //         const permission = await window.Notification.requestPermission();
    //         if (permission !== "granted") {
    //             console.log("Notification permission not granted.");
    //             return;
    //         }

    //         //   Get active service worker
    //         const registration = await navigator.serviceWorker.register(
    //             "/src/service-worker.js"
    //         );

    //         //   Get push subscription
    //         const subscription = await registration.pushManager.subscribe({
    //             userVisibleOnly: true,
    //             applicationServerKey: urlBase64ToUint8Array(
    //                 import.meta.env.VITE_VAPID_PUBLIC_KEY
    //             ),
    //         });

    //         // Send subscription to backend
    //         await axios.post(
    //             `${import.meta.env.VITE_API_URL}/notifications/subscribe`,
    //             subscription,
    //             { withCredentials: true }
    //         );

    //         console.log("Successfully subscribed to push notifications.");
    //     } catch (error) {
    //         console.error("Failed to subscribe to push notifications:", error);
    //     }
    // }, []);

    const checkAuthStatus = useCallback(async () => {
        try {
            // Panggil endpoint yang dilindungi untuk memeriksa status login
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/users/me`,
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setUser(response.data.data);
                setIsAuthenticated(true);
                // subscribeToNotifications();
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);
    // }, [subscribeToNotifications]);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const authContextValue = useMemo(
        () => ({ isAuthenticated, user, isLoading, checkAuthStatus }),
        [isAuthenticated, user, isLoading, checkAuthStatus]
    );

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
