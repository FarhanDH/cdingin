import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import InfoIcon from "@mui/icons-material/Info";
import NavigationIcon from "@mui/icons-material/Navigation";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { Button, CircularProgress, Fab } from "@mui/material";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import axios, { AxiosError } from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MoveLeft } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Circle,
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
} from "react-leaflet";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import mapPin from "~/assets/map-pin.png";
import phoneWhatsapp from "~/assets/whatsapp-telephone.png";
import { customToastStyle } from "~/common/custom-toast-style";
import {
    calculateDistanceInMeters,
    formattedDate,
    prettyDate,
} from "~/common/utils";
import EnableLocationSheet from "~/components/enable-location-sheet";
import AcProblemsCard from "~/components/orders/detail/ac-problems-card";
import AcUnitsCard from "~/components/orders/detail/ac-units-card";
import OrderInfoCard from "~/components/orders/detail/order-info-card";
import ServiceAddressCard from "~/components/orders/detail/service-address-card";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "~/components/ui/drawer";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import Spinner from "~/components/ui/spinner";
import SwipeButton from "~/components/ui/swipe-button";
import CancelOrderSheet from "~/customer/order/cancel-order-sheet";
import { blueDotIcon } from "~/customer/order/new/maps/current-location-marker";
import { useRouteCalculator } from "~/hooks/use-route-calculator";
import { useTechnicianLocation } from "~/hooks/use-technician-location";
import {
    getStatusLabel,
    type OrderItem,
    type OrderStatus,
} from "~/types/order.types";
import type { Route } from "./+types/technician-order-summary";

const SERVICE_RADIUS_METERS = 200;

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Ringkasan Pesanan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function TechnicianOrderSummary() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPhoneSheetOpen, setIsPhoneSheetOpen] = useState(false);
    const { text: statusText, bgColor: statusColor } = getStatusLabel(
        order?.status || "pending"
    );
    const [locationPermission, setLocationPermission] = useState<
        "prompt" | "granted" | "denied"
    >("prompt");
    const [isLocationPermissionSheetOpen, setIsLocationPermissionSheetOpen] =
        useState<boolean>(false);
    const [isCustomeCallSheetOpen, setIsCustomeCallSheetOpen] = useState(false);
    const [isNavigateSheetOpen, setIsNavigateSheetOpen] = useState(false);
    const { position: technicianPosition, requestLocation } =
        useTechnicianLocation();

    const serviceLocationPosition = useMemo(() => {
        if (!order) return null;
        return new L.LatLng(
            order.serviceLocation.latitude,
            order.serviceLocation.longitude
        );
    }, [order]);

    // Calculate the route and distance.
    const { route, distance, isLoadingRoute } = useRouteCalculator(
        technicianPosition,
        serviceLocationPosition
    );

    const handleCenterMap = () => {
        // 1. Request the latest location first
        requestLocation();

        // 2. Check if we have both positions to create bounds
        if (technicianPosition && serviceLocationPosition) {
            // Create a bounds object that includes both points
            const bounds = L.latLngBounds(
                technicianPosition,
                serviceLocationPosition
            );

            // Access the map instance via the ref and fit the bounds
            mapRef.current?.fitBounds(bounds, {
                padding: [50, 50], // Add some padding
                maxZoom: 16, // Prevent zooming in too close
            });
        }
    };

    const mapPinIcon = L.icon({
        iconUrl: mapPin, // path to your image
        iconSize: [25, 41], // size of the icon
    });

    /**
     * Checks the current status of the geolocation permission.
     * Updates the state and decides whether to show the prompt sheet.
     */
    const checkPermissionStatus = useCallback(async () => {
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
        checkPermissionStatus();
    }, [checkPermissionStatus]);

    //   Request location after permission allowed
    useEffect(() => {
        // If the permit has just been granted or already exists, and the position does not exist yet, request the location.
        if (locationPermission === "granted" && !technicianPosition) {
            requestLocation();
        }
    }, [locationPermission, technicianPosition, requestLocation]);

    const fetchOrderDetail = async () => {
        try {
            const orderData = await axios.get(
                `${import.meta.env.VITE_API_URL}/orders/technician/${orderId}`,
                {
                    withCredentials: true,
                }
            );

            setOrder(orderData.data.data);
            setIsLoading(false);
        } catch (error) {
            setError("Gagal mengambil detail pesanan");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!orderId) return;
        setIsLoading(true);
        setError(null);

        const fetchOrder = async () => {
            try {
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_API_URL
                    }/orders/technician/${orderId}`,
                    {
                        withCredentials: true,
                    }
                );
                setOrder(response.data.data);
            } catch (error) {
                setError("Gagal mengambil detail pesanan");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    // Custom toast message
    const showUpdateToast = (newStatus: OrderStatus, customerName: string) => {
        switch (newStatus) {
            case "confirmed":
                toast(
                    `Sip!, Pelanggan anda udah kami kabarin. 👍`,
                    customToastStyle
                );
                break;

            case "technician_on_the_way":
                toast(
                    `Sip!, Pelanggan anda udah kami kabarin. 👍`,
                    customToastStyle
                );
                break;

            case "on_working":
                toast(`Oke, mulai dikerjain. Semangaat! 💪`, customToastStyle);
                break;

            case "waiting_payment":
                // dipanggil setelah teknisi membuat tagihan
                toast(`Kerjaan beres! Tagihan udah siap. 💸`, customToastStyle);
                break;

            case "completed":
                //    Triggered by cash payment
                toast(`Mantap! Kerjaan beres! 🎉`, customToastStyle);
                break;

            case "cancelled":
                toast(`Oke, orderan dibatalkan. ❌`, customToastStyle);
                break;

            default:
                // Fallback jika ada status lain
                toast.info(`Status orderan diubah.`, customToastStyle);
                break;
        }
    };

    // Handle update order status
    const updateOrderStatus = async (newStatus: OrderStatus) => {
        if (!orderId) return;
        setIsUpdating(true);
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/orders/${orderId}/status`,
                {
                    status: newStatus,
                    technicianLatitude: technicianPosition?.lat,
                    technicianLongitude: technicianPosition?.lng,
                }, // Body request
                { withCredentials: true }
            );

            // Update local state order with new data from response
            setOrder(response.data.data);

            // Show notification
            showUpdateToast(newStatus, response.data.data.customer.fullName);
        } catch (err) {
            const errorMessage =
                err instanceof AxiosError
                    ? err.response?.data?.message
                    : "Terjadi kesalahan";
            toast(
                errorMessage || "Gagal memperbarui status.",
                customToastStyle
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCashPayment = async () => {
        if (!order) return;
        setIsUpdating(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/payments/invoices/${
                    order.invoiceId
                }/confirm-cash-payment`,
                {},
                { withCredentials: true }
            );

            // Update local state order with new data from response
            setOrder(response.data.data);

            showUpdateToast(
                response.data.data.status,
                response.data.data.customer.fullName
            );
        } catch (err) {
            const errorMessage =
                err instanceof AxiosError
                    ? err.response?.data?.message
                    : "Terjadi kesalahan";
            toast(
                errorMessage || "Gagal memperbarui status.",
                customToastStyle
            );
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle update button based on order status
    const getNextAction = () => {
        if (!order) return null;

        switch (order.status) {
            case "pending":
                return {
                    text: "Terima",
                    action: () => updateOrderStatus("confirmed"),
                };
            case "confirmed":
                return {
                    text: "Saya berangkat ke lokasi",
                    action: () => updateOrderStatus("technician_on_the_way"),
                };
            case "technician_on_the_way":
                return {
                    text: "Saya udah ketemu pelanggan",
                    /**
                     * Checks if the technician's position is close to the service location
                     * before setting the order status to "on_working".
                     * If not, shows an error toast.
                     */
                    action: () => {
                        // Is the technician's position close to the service location?
                        if (!technicianPosition || !serviceLocationPosition) {
                            toast(
                                "Lokasi Anda belum terdeteksi. Coba lagi.",
                                customToastStyle
                            );
                            requestLocation();
                            return;
                        }

                        const technicianDistanceWithServiceLocation =
                            calculateDistanceInMeters(
                                {
                                    lat: technicianPosition.lat,
                                    lng: technicianPosition.lng,
                                },
                                {
                                    lat: serviceLocationPosition.lat,
                                    lng: serviceLocationPosition.lng,
                                }
                            );

                        /**
                         * If the distance is greater than the service radius,
                         * show an error toast with the distance.
                         * If the distance is within the service radius,
                         * call the API to update the order status to "on_working".
                         */
                        if (
                            technicianDistanceWithServiceLocation >
                            SERVICE_RADIUS_METERS
                        ) {
                            toast(
                                `Masih sekitar ${distance} dari lokasi. Coba lebih dekat.`,
                                customToastStyle
                            );
                        } else {
                            // Call API when position valid
                            updateOrderStatus("on_working");
                        }
                    },
                };
            case "on_working":
                // navigasi ke halaman pembuatan tagihan
                return {
                    text: "Saya mau bikin tagihan",
                    action: () => {
                        navigate(
                            `/technician/order/${order.id}/invoice/create`
                        );
                    },
                };

            case "waiting_payment":
                return {
                    text: "Terima bayar tunai",
                    action: () => {
                        handleCashPayment();
                    },
                };
            default:
                return null;
        }
    };

    // Show the phone sheet only if the order status is "pending"
    useEffect(() => {
        if (order?.status === "pending") {
            setIsPhoneSheetOpen(true);
        }
    }, [order?.status]);

    const nextAction = getNextAction();

    const zoomValue = useMemo(() => {
        if (!technicianPosition || !order) return 12; // Default zoom

        const distance = calculateDistanceInMeters(
            { lat: technicianPosition.lat, lng: technicianPosition.lng },
            {
                lat: order.serviceLocation.latitude,
                lng: order.serviceLocation.longitude,
            }
        );

        if (distance < 500) return 18; // Sangat dekat
        if (distance < 1000) return 17; // < 1km
        if (distance < 2000) return 16; // < 2km
        if (distance < 5000) return 15; // < 5km
        if (distance < 10000) return 14; // < 10km
        return 13; // Far distance
    }, [technicianPosition, order]);

    const navigateToServiceLocationVehicle = (travelMode: string) => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${technicianPosition?.lat},${technicianPosition?.lng}&destination=${order?.serviceLocation.latitude},${order?.serviceLocation.longitude}&travelmode=${travelMode}`,
            "_blank"
        );
    };
    const mapRef = React.useRef<L.Map>(null);

    if (isLoading || isUpdating) {
        return (
            <div
                className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 ${
                    isLoading || isUpdating ? "bg-black/20" : ""
                }`}
            >
                <Dialog open={isLoading || isUpdating} modal>
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
        return <h1>Order gak ketemu</h1>;
    }

    return (
        <div className="">
            {isLoading && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-40">
                    <Spinner size={30} className="text-primary" />
                </div>
            )}

            {/* Map */}
            <div className="w-full">
                <MapContainer
                    ref={mapRef}
                    center={[
                        order.serviceLocation.latitude,
                        order.serviceLocation.longitude,
                    ]}
                    zoom={zoomValue}
                    style={{
                        height: "550px",
                        width: "100%",
                    }}
                    preferCanvas={true}
                    className="z-0"
                    zoomAnimation={true}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="absolute -top-10 left-0 right-0 mx-auto"
                    />
                    {/* Technician location marker */}
                    {technicianPosition && (
                        <>
                            <Circle
                                center={technicianPosition}
                                radius={13}
                                pathOptions={{
                                    color: "#1d4ed8",
                                    fillColor: "#3b82f6",
                                    fillOpacity: 0.2,
                                    weight: 1,
                                }}
                            />
                            <Marker
                                position={technicianPosition}
                                icon={blueDotIcon}
                            >
                                <Popup>Lokasi Kamu</Popup>
                            </Marker>
                        </>
                    )}
                    {/* Service location marker */}
                    {serviceLocationPosition && (
                        <Marker
                            position={serviceLocationPosition}
                            icon={mapPinIcon}
                        >
                            <Popup>Lokasi Pelanggan</Popup>
                        </Marker>
                    )}
                    {/* Route Polyline (now dynamic) */}
                    {route.length > 0 && (
                        <Polyline
                            positions={route}
                            color="#057895"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                    )}
                </MapContainer>
            </div>

            {/* Order Details Drawer */}
            <Drawer
                open={true}
                snapPoints={[0.4, 1]}
                snapToSequentialPoint={true}
                modal={false}
                repositionInputs={false}
                defaultOpen={true}
            >
                <DrawerContent
                    className="max-w-lg mx-auto bg-gray-100 rounded-t-3xl border-none z-10 h-[97%] scroll-smooth"
                    isOverlay={false}
                >
                    {/* Back button */}
                    <div className="absolute -top-15 left-4 flex items-center gap-2">
                        <Fab
                            size="medium"
                            className="z-10 bg-white p-2 rounded-full shadow-none cursor-pointer active:scale-95"
                            onClick={() => {
                                setIsLoading(true);
                                navigate("/technician/orders");
                            }}
                        >
                            <MoveLeft className="text-gray-600" />
                        </Fab>
                    </div>

                    {/* Google Map Navigation Button  */}
                    <div className="absolute -top-14 left-0 right-0 mx-auto max-w-lg justify-center flex items-center gap-4">
                        <Button
                            className="z-10 bg-secondary text-white normal-case !font-[Rubik] px-3 py-2 rounded-full shadow-md cursor-pointer active:scale-95"
                            onClick={() => {
                                setIsNavigateSheetOpen(true);
                            }}
                        >
                            <NavigationIcon className="text-white -rotate-45 mr-3" />
                            <p>Petunjuk arah</p>
                        </Button>
                    </div>

                    {/* Top right buttons */}
                    <div className="absolute -top-15 right-4 flex flex-col items-center gap-6">
                        {/* Request current location */}
                        <Fab
                            size="medium"
                            className="z-10 bg-gray-50 p-2 rounded-full shadow-md cursor-pointer"
                            onClick={handleCenterMap}
                        >
                            <GpsFixedIcon className="text-gray-700" />
                        </Fab>
                    </div>

                    <DrawerHeader className="border-b-2 border-gray-200 flex flex-col justify-center items-center">
                        {/* Order status badge */}
                        <span
                            className={`px-3 rounded-sm text-xs text-white text-center ${statusColor} flex items-center h-7 w-fit`}
                        >
                            {statusText}
                        </span>
                        <DrawerTitle className="font-medium text-gray-800 text-[15px] mt-1">
                            {prettyDate(new Date(order.serviceDate), "id")
                                .charAt(0)
                                .toUpperCase() +
                                prettyDate(
                                    new Date(order.serviceDate),
                                    "id"
                                ).slice(1)}{" "}
                            -{" "}
                            {formattedDate(order.serviceDate, {
                                withTime: false,
                            })}
                        </DrawerTitle>
                    </DrawerHeader>
                    <ScrollArea
                        className="px-4 flex-grow bg-gray-100 overflow-y-auto z-10 scroll-smooth"
                        showScrollBar={false}
                    >
                        <div className="space-y-3 mt-4">
                            {/* Customer Card */}
                            <div className="bg-[#DBF8FF] rounded-3xl">
                                <div className="p-4 bg-white rounded-3xl shadow-xs  border-gray-200">
                                    <div className="flex gap-4">
                                        {/* Person Icon */}
                                        <div className="mb-2 bg-blue-400 w-9 h-9 rounded-full flex items-center justify-center text-center">
                                            <PersonIcon className="text-white w-20" />
                                        </div>
                                        <div className="w-full">
                                            <div className="flex justify-between w-full">
                                                <div>
                                                    <p className="text-gray-700 text-sm text-start">
                                                        Dipesan oleh
                                                    </p>
                                                    <p className="font-semibold text-lg text-gray-700 flex items-center">
                                                        {order.customer
                                                            .fullName ||
                                                            "Tidak ada nama"}{" "}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Note for technician */}
                                            {order.note && (
                                                <div className="flex items-start mt-2 gap-2 w-full rounded bg-gray-100 p-2 border-l-4 border-gray-500">
                                                    <p className="text-gray-600 text-sm w-full">
                                                        {order.note}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {order.status !== "completed" &&
                                    order.status !== "cancelled" && (
                                        <div className="flex items-center p-4 gap-2">
                                            <InfoIcon
                                                className="text-primary"
                                                // fontSize="small"
                                            />
                                            <p className="text-xs font-normal">
                                                Kadang titik lokasi atau detail
                                                AC bisa kurang pas. Coba tanyain
                                                dulu ke pelanggan biar lebih
                                                yakin 😉.
                                            </p>
                                        </div>
                                    )}
                            </div>

                            <ServiceAddressCard
                                order={order}
                                serviceAddress={
                                    order.serviceLocation.address ??
                                    "Memuat alamat..."
                                }
                            />
                            <AcProblemsCard problems={order.problems} />
                            <AcUnitsCard
                                acUnits={order.acUnits}
                                totalUnits={order.totalUnits}
                            />
                            <OrderInfoCard order={order} />

                            {/* Cancel Button */}
                            {order.status !== "cancelled" &&
                                order.status !== "completed" && (
                                    // Cancel button
                                    <Button
                                        className="w-full rounded-full bg-destructive/10 border-t-[1.5px] py-3.5 text-base hover:bg-destructive/20 border-gray-200 cursor-pointer text-red-600 normal-case !font-[Rubik] active:scale-95"
                                        onClick={() =>
                                            setIsCancelSheetOpen(true)
                                        }
                                    >
                                        Batalkan pesanan
                                    </Button>
                                )}
                            <div className="mb-40 bg-none" />
                        </div>
                    </ScrollArea>
                </DrawerContent>
            </Drawer>

            {/* Bottom panel */}
            <div
                className={`w-full px-3 gap-4 fixed bottom-0 max-w-lg mx-auto  bg-white z-50`}
            >
                <div className="flex items-center mb-2 gap-2 justify-between">
                    {/* Order ID */}
                    <Button className="flex flex-col items-center justify-center text-center !font-[Rubik] normal-case text-xs font-normal active:bg-gray-100 hover:bg-gray-50 rounded-none w-full h-full">
                        <p className="text-xs text-gray-600">Order ID</p>
                        <p className="font-semibold text-xs text-gray-800">
                            {order.id}
                        </p>
                    </Button>
                    <div className="border-r-1 rounded-none border-gray-500 h-8" />

                    {/* Phone Button */}
                    <Button
                        onClick={() => {
                            setIsCustomeCallSheetOpen(true);
                        }}
                        disabled={!order.customer.phone}
                        className="!font-[Rubik] normal-case text-gray-600 text-xs font-normal flex flex-col rounded-none border-gray-200 hover:bg-gray-50 active:bg-gray-100 w-full h-full"
                    >
                        <PhoneIcon
                            className="text-gray-900"
                            fontSize="medium"
                        />
                        Hubungi pelanggan
                    </Button>

                    {/* Invoice Button */}
                    {order.invoiceId && (
                        <>
                            {/* Right Divider */}
                            <div className="border-r-1 rounded-none border-gray-500 h-8" />
                            <Button
                                onClick={() => {
                                    // Handle to invoice page
                                    navigate(
                                        `/technician/order/${order.id}/invoice`
                                    );
                                }}
                                disabled={!order.customer.phone}
                                className="!font-[Rubik] normal-case text-gray-600 text-xs font-normal flex flex-col rounded-none border-gray-200 hover:bg-gray-50 active:bg-gray-100 w-full h-full"
                            >
                                <ReceiptIcon
                                    className="text-gray-900"
                                    fontSize="medium"
                                />
                                Lihat tagihan
                            </Button>
                        </>
                    )}
                </div>

                {/* next action swipe button */}
                {nextAction && (
                    <SwipeButton
                        onSubmit={nextAction.action}
                        text={nextAction.text}
                        className="w-full absolute max-w-lg bottom-0 left-0 right-0 mx-auto bg-primary z-50 mb-4 text-[15px]"
                    />
                )}
            </div>

            {/* Show Order sheet when cancel button clicked */}
            <CancelOrderSheet
                isOpen={isCancelSheetOpen}
                onClose={() => setIsCancelSheetOpen(false)}
                orderId={order.id}
                actor="technician"
                onSuccess={() => {
                    setIsCancelSheetOpen(false);
                    fetchOrderDetail();
                }}
            />

            {/* Show Enable Location Sheet */}
            <EnableLocationSheet
                isOpen={isLocationPermissionSheetOpen}
                onOpenChange={setIsLocationPermissionSheetOpen}
                onActivate={handleActivateLocation}
            />

            {/* Show when order status is pending */}
            <Sheet open={isPhoneSheetOpen} onOpenChange={setIsPhoneSheetOpen}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-w-lg mx-auto text-center"
                    // Prevent close sheet beyond interaction
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <SheetHeader className="">
                        <div className="rounded-4xl">
                            <img
                                src={phoneWhatsapp}
                                alt="Ilustrasi Peta"
                                className="w-full mx-auto"
                            />
                        </div>
                        <SheetTitle className="text-xl font-bold">
                            Hubungi Pelanggan Dulu, Yuk!
                        </SheetTitle>
                        <SheetDescription className="text-[16px] text-gray-600">
                            Sebelum terima pesanan, coba hubungi pelanggan dulu
                            lewat WhatsApp atau telepon.
                        </SheetDescription>
                        <Button
                            onClick={() => setIsPhoneSheetOpen(false)}
                            className="bg-primary text-base text-white normal-case !font-[Rubik] w-full h-12 rounded-full text-md font-semibold mt-6 active:scale-95"
                        >
                            Oke, mengerti
                        </Button>
                    </SheetHeader>
                </SheetContent>
            </Sheet>

            {/* Show when "Hubungi Pelanggan" is clicked */}
            <Sheet
                open={isCustomeCallSheetOpen}
                onOpenChange={setIsCustomeCallSheetOpen}
            >
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-w-lg mx-auto text-start"
                    // Prevent close sheet beyond interaction
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <SheetHeader className="">
                        <SheetTitle className="text-xl font-bold">
                            Pilih Cara Menghubungi
                        </SheetTitle>
                        <SheetDescription className="text-[16px] text-gray-600">
                            Kalau tidak terhubung di WhatsApp, coba telepon
                            pakai pulsa biasa!
                        </SheetDescription>
                        {/* Button for phone call */}
                        <Button
                            onClick={() => {
                                setIsCustomeCallSheetOpen(false);
                                // Handle phone call
                                window.open(
                                    `tel:+62${order.customer.phone}`,
                                    "_blank"
                                );
                            }}
                            className="bg-white border-green-600 border text-base text-green-600 normal-case !font-[Rubik] w-full h-12 rounded-full text-md font-semibold mt-6 active:scale-95"
                        >
                            Hubungi pakai pulsa
                        </Button>

                        {/* Button for whatsapp call */}
                        <Button
                            onClick={() => {
                                setIsCustomeCallSheetOpen(false);
                                // Handle phone call to WhatsApp
                                window.open(
                                    `https://api.whatsapp.com/send?phone=62${order.customer.phone}`,
                                    "_blank"
                                );
                            }}
                            className="bg-green-600 text-base text-white normal-case !font-[Rubik] w-full h-12 rounded-full text-md font-semibold mt-3 active:scale-95"
                        >
                            Hubungi pakai WhatsApp
                        </Button>
                    </SheetHeader>
                </SheetContent>
            </Sheet>

            {/* Show when "Navigate" is clicked */}
            <Sheet
                open={isNavigateSheetOpen}
                onOpenChange={setIsNavigateSheetOpen}
            >
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-w-lg mx-auto text-start"
                    // Prevent close sheet beyond interaction
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <SheetHeader className="">
                        <div className="rounded-4xl"></div>
                        <SheetTitle className="text-xl font-bold">
                            Pilih Kendaraanmu
                        </SheetTitle>
                        <SheetDescription className="text-[16px] text-gray-600">
                            Biar Google Maps bisa kasih rute paling pas, pilih
                            dulu kendaraan yang mau dipakai ke lokasi pelanggan.
                        </SheetDescription>
                        {/* Button two-wheeler vehicel */}
                        <Button
                            onClick={() => {
                                setIsNavigateSheetOpen(false);
                                navigateToServiceLocationVehicle("two-wheeler");
                            }}
                            className="bg-white border-primary border text-base text-primary normal-case !font-[Rubik] w-full h-12 rounded-full text-md font-semibold mt-6 active:scale-95"
                        >
                            Saya naik motor
                        </Button>

                        {/* Button for whatsapp call */}
                        <Button
                            onClick={() => {
                                setIsNavigateSheetOpen(false);
                                // Handle phone call to WhatsApp
                                navigateToServiceLocationVehicle("driving");
                            }}
                            className="bg-primary text-base text-white normal-case !font-[Rubik] w-full h-12 rounded-full text-md font-semibold mt-3 active:scale-95"
                        >
                            Saya naik mobil
                        </Button>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </div>
    );
}
