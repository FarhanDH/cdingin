import { Button, CircularProgress } from "@mui/material";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import axios from "axios";
import L, { latLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useNavigate, useParams } from "react-router";
import cashImage from "~/assets/cash.png";
import mapPin from "~/assets/map-pin.png";
import Header from "~/components/header";
import AcProblemsCard from "~/components/orders/detail/ac-problems-card";
import AcUnitsCard from "~/components/orders/detail/ac-units-card";
import OrderInfoCard from "~/components/orders/detail/order-info-card";
import ServiceAddressCard from "~/components/orders/detail/service-address-card";
import { Drawer, DrawerContent, DrawerHeader } from "~/components/ui/drawer";
import { ScrollArea } from "~/components/ui/scroll-area";
import CancelOrderSheet from "~/customer/order/cancel-order-sheet";
import { getStatusLabel, type OrderItem } from "~/types/order.types";
import type { Route } from "./+types/customer-order-detail";
import Pusher from "pusher-js";
import { toast } from "sonner";
import { customToastStyle } from "~/common/custom-toast-style";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Detail Pesanan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function CustomerOrderDetail() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<OrderItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
    const { text: statusText, textColor: statusColor } = getStatusLabel(
        order?.status || "pending"
    );
    const navigate = useNavigate();

    const mapPinIcon = L.icon({
        iconUrl: mapPin, // path to your image
        iconSize: [25, 41], // size of the icon
    });

    const fetchOrderDetail = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
                {
                    withCredentials: true,
                }
            );
            setOrder(response.data.data);
            setIsLoading(false);
        } catch (error) {
            setError("Gagal mengambil detail pesanan");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to load initial data order
    useEffect(() => {
        if (!orderId) return;
        setIsLoading(true);
        setError(null);

        const fetchOrder = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
                    {
                        withCredentials: true,
                    }
                );
                setOrder(response.data.data);
                setIsLoading(false);
            } catch (error) {
                setError("Gagal mengambil detail pesanan");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    // Effect to connect Pusher Real-Time
    useEffect(() => {
        const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        });

        const channelName = `order-${orderId}-customer`;
        const channel = pusher.subscribe(channelName);

        // Bind and Listen Even 'status-updated'
        channel.bind("status-updated-customer", (data: any) => {
            console.log("Real-time Status update: ", data.newStatus);

            fetchOrderDetail();

            toast(data.message, customToastStyle);
        });

        return () => {
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        };
    }, [orderId]);

    if (isLoading) {
        return (
            <div
                className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 ${
                    isLoading ? "bg-black/20" : ""
                }`}
            >
                <Dialog open={isLoading} modal>
                    <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
                        <CircularProgress size={30} className="text-primary" />
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    if (error) {
        return <h1>{error}</h1>;
    }

    if (!order) {
        return <h1>Order not found</h1>;
    }

    return (
        <div className="">
            <Header
                title="Detail pesanan"
                showBack
                isSticky
                showBorder={false}
                navigateTo="/orders"
                className="bg-white"
            />

            {/* Map */}
            <div className="w-full">
                <MapContainer
                    center={[
                        order.serviceLocation.latitude,
                        order.serviceLocation.longitude,
                    ]}
                    zoom={17}
                    style={{ height: "660px", width: "100%" }}
                    preferCanvas={true}
                    className="z-0"
                    zoomAnimation={true}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="absolute -top-10 left-0 right-0 mx-auto"
                    />
                    {/* Service location marker */}
                    {order.serviceLocation && (
                        <Marker
                            position={latLng(
                                order.serviceLocation.latitude,
                                order.serviceLocation.longitude
                            )}
                            icon={mapPinIcon}
                        />
                    )}
                </MapContainer>
            </div>

            {/* Drawer */}
            <Drawer
                open={true}
                snapPoints={[0.4, 1]}
                snapToSequentialPoint={true}
                modal={false}
                repositionInputs={false}
                defaultOpen={true}
            >
                <DrawerContent
                    className={`max-w-lg mx-auto z-10 h-[85vh] ${
                        order.invoiceId &&
                        order.status !== "completed" &&
                        "mb-30"
                    } ${
                        order.invoiceId &&
                        order.status === "completed" &&
                        "mb-10"
                    }`}
                    isTopRounded={false}
                    isDoubleHandleBar
                    isOverlay={false}
                >
                    <DrawerHeader className="bg-white flex">
                        {/* <DrawerTitle className="text-base font-bold text-gray-800"> */}
                        <span
                            className={`rounded-sm text-base ${statusColor} text-center flex items-center h-7 w-fit font-medium`}
                        >
                            {statusText}
                        </span>
                        {/* </DrawerTitle> */}
                    </DrawerHeader>

                    <ScrollArea
                        className={`flex-grow overflow-y-auto bg-gray-100`}
                        showScrollBar={false}
                    >
                        <div className="p-4 flex flex-col gap-2">
                            <ServiceAddressCard
                                order={order}
                                serviceAddress={order.serviceLocation.address}
                            />
                            <AcProblemsCard problems={order.problems} />
                            <AcUnitsCard
                                acUnits={order.acUnits}
                                totalUnits={order.totalUnits}
                            />

                            {order?.note && (
                                <div className="p-4 bg-white rounded-xl shadow-xs border border-gray-200 w-full">
                                    <div className="flex gap-4">
                                        <div className="w-full">
                                            <h1 className="font-medium">
                                                Catatan untuk teknisi
                                            </h1>
                                            <div className="flex items-start mt-2 gap-2 w-full bg-gray-100 p-2 border-l-4 border-gray-500 rounded">
                                                <p className="text-gray-700 text-sm w-full">
                                                    {order.note}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <OrderInfoCard order={order} />

                            {/* Button */}
                            <div>
                                {order.status === "pending" && (
                                    <Button
                                        className="w-full h-12 text-base text-red-500 bg-destructive/20 hover:bg-destructive/30 active:bg-destructive/40 active:scale-95 text-md font-semibold cursor-pointer rounded-full capitalize !font-[Rubik]"
                                        onClick={() => {
                                            setIsCancelSheetOpen(true);
                                        }}
                                    >
                                        Batalkan pesanan
                                    </Button>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </DrawerContent>
            </Drawer>

            {/* Invoice Button */}
            {order.invoiceId && (
                <div
                    className={`w-full px-4 pt-2 border bg-white  gap-4 fixed bottom-0 max-w-lg mx-auto z-50`}
                >
                    <div
                        className={`bg-white pb-4 ${
                            order.status === "completed" && "rounded-t-3xl"
                        }`}
                    >
                        {order.status !== "completed" && (
                            <>
                                <h1 className="text-lg font-semibold mt-1">
                                    Tagihan Udah Siap!
                                </h1>
                                <div className="my-1 mb-2 flex items-center gap-2">
                                    <img
                                        src={cashImage}
                                        alt="cash"
                                        className="w-6 h-6"
                                    />
                                    <p className="text-sm text-gray-600">
                                        Pembayaran bisa dengan tunai, atau
                                        digital lohh
                                    </p>
                                </div>
                            </>
                        )}
                        <Button
                            onClick={() =>
                                navigate(`/order/${orderId}/invoice`)
                            }
                            className="w-full h-12 rounded-full text-base font-medium flex items-center justify-center bg-primary text-white normal-case !font-[Rubik] active:scale-95"
                        >
                            <Wallet size={20} className="mr-2" />
                            {order.status === "completed"
                                ? "Lihat tagihan"
                                : "Lihat & bayar tagihan"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Show Order sheet when cancel button clicked */}
            <CancelOrderSheet
                isOpen={isCancelSheetOpen}
                onClose={() => setIsCancelSheetOpen(false)}
                orderId={order.id}
                actor="customer"
                onSuccess={() => {
                    setIsCancelSheetOpen(false);
                    fetchOrderDetail();
                }}
            />
        </div>
    );
}
