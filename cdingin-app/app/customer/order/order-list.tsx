import Fab from "@mui/material/Fab";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@radix-ui/react-dialog";
import axios from "axios";
import { PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { toast } from "sonner";
import threeTechniciansImage from "~/assets/three-technicians.png";
import Header from "~/components/header";
import NotificationPermissionSheet from "~/components/notification-permission-sheet";
import Spinner from "~/components/ui/spinner";
import CustomerOrderCard from "~/customer/order/order-card";
import { useNotificationPermission } from "~/hooks/use-notification-permission";
import type {
    CustomerOrderTabType,
    CustomerTabItem,
    CustomerOrderCounts,
    OrderItem,
} from "~/types/order.types";
import CustomerOrderTab from "./order-tab-status";
import type { CustomerLayoutContext } from "~/routes/customer/layout";

export default function CustomerOrderList() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isNavigating, setIsNavigating] = useState<boolean>(false);
    const [activeTab, setActiveTab] =
        useState<CustomerOrderTabType>("progress");
    const { orderCounts, refetchOrderCounts } =
        useOutletContext<CustomerLayoutContext>();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { permission, requestPermission } = useNotificationPermission();

    // Fetch orders data for each activeTab changing
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/orders`,
                    {
                        params: {
                            status: activeTab,
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

    const handleCreateOrderClick = () => {
        // Logika menjadi lebih sederhana
        if (permission === "granted") {
            navigate("/order/new");
        } else if (permission === "denied") {
            toast.error(
                "Kamu harus mengizinkan notifikasi di pengaturan browser."
            );
        } else {
            // 'prompt'
            setIsSheetOpen(true);
        }
    };

    const handleConfirmPermission = async () => {
        setIsSheetOpen(false);
        await requestPermission();
    };

    const tabs: CustomerTabItem[] = [
        { id: "progress", label: "Proses" },
        { id: "completed", label: "Selesai" },
        { id: "cancelled", label: "Dibatalkan" },
    ];

    return (
        <div>
            {(isNavigating || isLoading) && (
                <div
                    className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50 ${
                        isLoading ? "bg-black/50" : ""
                    }`}
                >
                    <Dialog open={isLoading} modal>
                        <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
                            <DialogTitle></DialogTitle>
                            <DialogDescription></DialogDescription>
                            <Spinner size={30} className="text-primary" />
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
                >
                    <CustomerOrderTab
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        orderCounts={orderCounts}
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
                            Masih sepi di sini!
                        </h1>
                        <p className="text-sm text-gray-500 font-light">
                            Cuci, pasang, bongkar, dan servis AC? Semuanya bisa
                            di sini. Cobain, yuk!
                        </p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <CustomerOrderCard key={order.id} order={order} />
                    ))
                )}

                {/* FLoating Action Button */}
                <div className="fixed bottom-20 left-0 right-4 max-w-lg mx-auto z-50 h-0">
                    <div className="flex justify-end items-end pb-10 pl-12 h-0">
                        <Fab
                            size="large"
                            // aria-label="add"
                            onClick={handleCreateOrderClick}
                            className="bg-primary rounded-xl active:scale-95"
                        >
                            <PlusIcon className="text-white" />
                        </Fab>
                        {/* <button
              className="w-15 h-15 bg-primary text-white flex justify-center items-center rounded-xl cursor-pointer active:bg-[#004A5A] hover:bg-primary/90 mr-4.5 mb-15 shadow-md shadow-neutral-500"
              onClick={handleActionButton}
            >
              <PlusIcon size={26} />
            </button> */}
                    </div>
                </div>
            </div>

            {/* Notification prompt */}
            <NotificationPermissionSheet
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                onConfirm={handleConfirmPermission}
                title="Izinkan notifikasi, yuk!"
                description="Biar gak ketinggalan info penting dari teknisi, seperti saat mereka OTW ke lokasimu."
            />
        </div>
    );
}
