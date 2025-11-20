import { CircularProgress } from "@mui/material";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@radix-ui/react-dialog";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import threeTechniciansImage from "~/assets/three-technicians.png";
import EnableLocationSheet from "~/components/enable-location-sheet";
import Header from "~/components/header";
import NotificationPermissionSheet from "~/components/notification-permission-sheet";
import { useNotificationPermission } from "~/hooks/use-notification-permission";
import type { OrderItem, TechnicianTabItem } from "~/types/order.types";
import type { TechnicianLayoutContext } from "~/routes/technician/layout";
import TechnicianOrderCard from "./order-card";
import type { TechnicianTabId } from "./technician-order-tab";
import TechnicianOrderTab from "./technician-order-tab";

export default function TechnicianOrderList() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<TechnicianTabId>("today");
    const { orderCounts, refetchOrderCounts } =
        useOutletContext<TechnicianLayoutContext>();
    const [locationPermission, setLocationPermission] = useState<
        "prompt" | "granted" | "denied"
    >("prompt");
    const [isLocationPermissionSheetOpen, setIsLocationPermissionSheetOpen] =
        useState(false);
    const [
        isNotificationPermissionSheetOpen,
        setIsNotificationPermissionSheetOpen,
    ] = useState(false);
    const { permission, requestPermission, isSubscribing } =
        useNotificationPermission();

    /**
     * Checks the current status of the geolocation permission.
     * Updates the state and decides whether to show the prompt sheet.
     */
    const checkLocationPermissionStatus = useCallback(async () => {
        if (!navigator.permissions) {
            // Fallback for older browsers
            setLocationPermission("granted");
            return;
        }
        try {
            const permissionStatus = await navigator.permissions.query({
                name: "geolocation",
            });
            setLocationPermission(permissionStatus.state); // 'granted', 'prompt', or 'denied'

            // Show the sheet only if the user hasn't made a choice yet ('prompt')
            if (permissionStatus.state === "prompt") {
                setIsLocationPermissionSheetOpen(true);
            }

            // Listen for changes (e.g., user allows/blocks from browser settings)
            permissionStatus.onchange = () => {
                setLocationPermission(permissionStatus.state);
                if (permissionStatus.state === "granted") {
                    setIsLocationPermissionSheetOpen(false); // Automatically close sheet if permission is granted
                }
            };
        } catch (error) {
            console.error("Permission query failed:", error);
            // Assume granted if query fails, to not block the user
            setLocationPermission("granted");
        }
    }, []);

    // --- RUN CHECKING WHEN COMPONENT MOUNTED FOR NOTIFICATION PERMISSION ---
    useEffect(() => {
        if (permission === "prompt") {
            const timer = setTimeout(
                () => setIsNotificationPermissionSheetOpen(true),
                1500
            );
            return () => clearTimeout(timer);
        }
    }, [permission]);

    // --- RUN CHECKING WHEN COMPONENT MOUNTED FOR LOCATION PERMISSION ---
    useEffect(() => {
        checkLocationPermissionStatus();
    }, [checkLocationPermissionStatus]);

    const handleConfirmPermission = async () => {
        setIsNotificationPermissionSheetOpen(false);
        await requestPermission();
    };

    /**
     * This function is called when the "Aktifkan Lokasi" button is clicked.
     * It triggers the browser's native permission prompt.
     */
    const handleActivateLocation = () => {
        navigator.geolocation.getCurrentPosition(
            // Success callback (user clicked "Allow")
            () => {
                // The 'onchange' listener in checkPermissionStatus will handle the state update
                // and close the sheet automatically.
            },
            // Error callback (user clicked "Block")
            () => {
                // The 'onchange' listener will also handle this.
                // The sheet will remain open, and you could show an error message.
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    };

    useEffect(() => {
        // Refetch counts every time the tab changes to ensure data is fresh
        refetchOrderCounts();
    }, [activeTab, refetchOrderCounts]);

    // Fetch orders data for each activeTab changing
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/orders/technician`,
                    {
                        params: {
                            "service-date": activeTab,
                        },
                        withCredentials: true,
                    }
                );

                setOrders(response.data.data);
            } catch (error) {
                console.error(
                    `Gagal mengambil pesanan untuk tab ${activeTab}:`,
                    error
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [activeTab]);

    const tabs: TechnicianTabItem[] = [
        { id: "today", label: "Hari Ini" },
        { id: "tomorrow", label: "Besok" },
        { id: "upcoming", label: "Mendatang" },
    ];

    return (
        <div>
            {isLoading && (
                <div
                    className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50 ${
                        isLoading ? "bg-black/50" : ""
                    }`}
                >
                    <Dialog open={isLoading} modal>
                        <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
                            <DialogTitle></DialogTitle>
                            <DialogDescription></DialogDescription>
                            <CircularProgress
                                size={30}
                                className="text-primary"
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            <div>
                {/* Header */}
                <Header
                    isSticky={true}
                    title="Daftar Pesanan"
                    showProfile
                    className="bg-white"
                    orderCounts={orderCounts ?? undefined}
                >
                    <TechnicianOrderTab
                        tabs={tabs}
                        activeTab={activeTab}
                        orderCounts={orderCounts}
                        onTabChange={setActiveTab}
                    />
                </Header>

                {/* Order List */}
                {orders.length === 0 ? (
                    <div className="mt-10 items-center w-full mb-auto flex flex-col text-center p-4">
                        <img
                            src={threeTechniciansImage}
                            alt={threeTechniciansImage}
                            className="w-80 max-w-lg mb-6"
                        />
                        <h1 className="font-semibold text-lg">
                            Belum Ada Pesanan, Nih
                        </h1>
                        <p className="text-sm text-gray-500 font-light max-w-xs">
                            Lagi santai, ya? Nanti kalau ada pesanan baru, bakal
                            langsung muncul di sini. Siap-siap, ya!
                        </p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <TechnicianOrderCard key={order.id} order={order} />
                    ))
                )}
            </div>

            {/* Show Enable Location Sheet */}
            <EnableLocationSheet
                isOpen={isLocationPermissionSheetOpen}
                onOpenChange={setIsLocationPermissionSheetOpen}
                onActivate={handleActivateLocation}
            />

            <NotificationPermissionSheet
                isOpen={isNotificationPermissionSheetOpen}
                onOpenChange={setIsNotificationPermissionSheetOpen}
                onConfirm={handleConfirmPermission}
                title="Dapetin info orderan lebih cepet!"
                description="Yuk, izinkan notifikasi biar kamu langsung tahu kalau ada pesanan baru yang masuk."
            />
        </div>
    );
}
