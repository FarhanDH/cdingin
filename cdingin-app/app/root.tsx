import GlobalStyles from "@mui/material/GlobalStyles";
import { StyledEngineProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Toaster } from "sonner";
import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./contexts/auth.context";
import NotFoundPage from "./pages/not-found";
import axios from "axios";
import OfflineSheet from "./components/offline-sheet";

export const links: Route.LinksFunction = () => [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    { rel: "manifest", href: "/manifest.webmanifest" },
    // Rubik font
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap",
    },
    {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180",
    },
    // Outfit font
    // {
    //     rel: "stylesheet",
    //     href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
    // },
];

export function Layout({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/service-worker.js", { scope: "/" })
                .then(() => console.log("SW registered"))
                .catch((err) => console.error("SW failed", err));

            /**
             * Handle message event from service worker.
             * If the event data has a type of "NOTIFICATION_CLICK", it will call the markNotificationAsRead function to mark the notification as read.
             * @param {Event} event - The event object from the service worker.
             */
            const handleMessage = (
                event: MessageEvent<{ type: string; notificationId: string }>
            ) => {
                // Cek apakah pesan berasal dari service worker dan memiliki tipe yang benar
                if (event.data && event.data.type === "NOTIFICATION_CLICK") {
                    const { notificationId } = event.data;
                    // Panggil fungsi untuk menandai notifikasi sebagai sudah dibaca
                    markNotificationAsRead(notificationId);
                }
            };

            navigator.serviceWorker.addEventListener("message", handleMessage);

            return () => {
                navigator.serviceWorker.removeEventListener(
                    "message",
                    handleMessage
                );
            };
        }

        // Handle Online/Offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Set initial status
        if (typeof navigator !== "undefined") setIsOnline(navigator.onLine);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            await axios.post(
                `${
                    import.meta.env.VITE_API_URL
                }/notifications/${notificationId}/read`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <html lang="id">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta
                    name="viewport"
                    content="width=device-width, user-scalable=no"
                />
                <meta
                    name="cdingin"
                    content="Servis AC jadi gampang, tinggal ngeklik doang!"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <div className="min-h-screen max-w-lg mx-auto border border-gray-100">
                    {children}
                    <OfflineSheet isOpen={!isOnline} />
                </div>
                <Toaster
                    position="top-center"
                    className="bg-gray-100 text-center text-lg"
                />
                <ScrollRestoration />
                <Scripts />
                {/* <script src="service-worker.js" type="module"></script> */}
                <script>var global = global || window;</script>
            </body>
        </html>
    );
}

export default function App() {
    return (
        <StyledEngineProvider enableCssLayer>
            <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        </StyledEngineProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    return <NotFoundPage />;
}
