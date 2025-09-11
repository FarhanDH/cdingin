import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import NavigationIcon from "@mui/icons-material/Navigation";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Button, Fab } from "@mui/material";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import axios, { AxiosError } from "axios";
import L from "leaflet";
import { ChevronRight, HomeIcon, MoveLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Circle,
    MapContainer,
    Marker,
    Polyline,
    TileLayer,
} from "react-leaflet";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import noteFilled from "~/assets/note-filled.png";
import { calculateDistanceInMeters } from "~/common/utils";
import { customToastStyle } from "~/common/custom-toast-style";
import EnableLocationSheet from "~/components/enable-location-sheet";
import { ScrollArea } from "~/components/ui/scroll-area";
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
import "leaflet/dist/leaflet.css";

const SERVICE_RADIUS_METERS = 200;

export default function TechnicianOrderSummary() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
    const [detailAddress, setDetailAddress] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const { text: statusText, color: statusColor } = getStatusLabel(
        order?.status || "pending"
    );
    const [locationPermission, setLocationPermission] = useState<
        "prompt" | "granted" | "denied"
    >("prompt");
    const [isLocationPermissionSheetOpen, setIsLocationPermissionSheetOpen] =
        useState(false);
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
                const detailLocation = await axios.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    {
                        params: {
                            lat: response.data.data.serviceLocation.latitude,
                            lon: response.data.data.serviceLocation.longitude,
                            format: "json",
                        },
                    }
                );
                setDetailAddress(detailLocation.data);
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

    // Custom toast message
    const showUpdateToast = (newStatus: OrderStatus, customerName: string) => {
        switch (newStatus) {
            case "confirmed":
                toast(
                    `Sip!, Pelangganmu udah kami kabarin. 👍`,
                    customToastStyle
                );
                break;

            case "technician_on_the_way":
                toast(
                    `Berangkaaat! Hati-hati di jalan, ya. 🛵`,
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
                // dipicu oleh sistem setelah customer bayar
                toast(`Lunas! Orderan selesai! 🙌`, customToastStyle);
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
                    text: "Berangkat ke lokasi",
                    action: () => updateOrderStatus("technician_on_the_way"),
                };
            case "technician_on_the_way":
                return {
                    text: "Udah ketemu pelanggan",
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
                                `Masih sekitar ${distance} dari lokasi. Coba majuan lagi.`,
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
                    text: "Geser untuk Buat Tagihan",
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

    const nextAction = getNextAction();

    if (isLoading || isUpdating) {
        return (
            <div
                className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 ${
                    isLoading || isUpdating ? "bg-black/20" : ""
                }`}
            >
                <Dialog open={isLoading || isUpdating} modal>
                    <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
                        <Spinner size={30} className="text-primary" />
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
        <div className="relative">
            {isLoading && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <Spinner size={30} className="text-primary" />
                </div>
            )}

            <div className="w-full">
                <MapContainer
                    center={[
                        order.serviceLocation.latitude,
                        order.serviceLocation.longitude,
                    ]}
                    zoom={13}
                    style={{ height: "550px", width: "100%" }}
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
                            />
                        </>
                    )}
                    {/* Service location marker */}
                    {serviceLocationPosition && (
                        <Marker position={serviceLocationPosition} />
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

            {/* Bottom Panel */}
            <div
                className={`w-full p-4 gap-4 flex flex-col fixed bottom-0 max-w-lg mx-auto rounded-t-3xl border bg-white`}
            >
                {/* Top left back button */}
                <div className="absolute -top-15 left-4 flex items-center gap-2">
                    <Fab
                        size="medium"
                        className="z-10 bg-gray-50 p-2 rounded-full shadow-md cursor-pointer"
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
                        className="z-10 bg-secondary text-white capitalize px-3 py-2 rounded-full shadow-md cursor-pointer text-md"
                        onClick={() => {
                            window.open(
                                `https://www.google.com/maps/dir/?api=1&origin=${technicianPosition?.lat},${technicianPosition?.lng}&destination=${order.serviceLocation.latitude},${order.serviceLocation.longitude}`,
                                "_blank"
                            );
                        }}
                    >
                        <NavigationIcon className="text-white -rotate-45 mr-3" />
                        <p>Petunjuk arah</p>
                    </Button>
                </div>

                {/* Top right current location button */}
                <div className="absolute -top-15 right-4 flex items-center gap-2">
                    <Fab
                        size="medium"
                        className="z-10 bg-gray-50 p-2 rounded-full shadow-md cursor-pointer"
                        onClick={requestLocation}
                    >
                        <GpsFixedIcon className="text-primary" />
                    </Fab>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex justify-center items-center gap-2 text-lg">
                        <h1>Order ID </h1>{" "}
                        <h1 className="font-medium">{order.id}</h1>
                    </div>
                </div>

                <ScrollArea
                    className="h-50 w-full scroll-smooth"
                    showScrollBar={false}
                >
                    {/* Customer Card */}
                    <div className="py-4 bg-white">
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
                                            {order.customer.fullName ||
                                                "Tidak ada nama"}{" "}
                                        </p>
                                    </div>

                                    {/* Right Section */}
                                    <div className="flex-col flex justify-end items-end text-end gap-1">
                                        {/* Order status badge */}
                                        <span
                                            className={`px-3 rounded-sm text-xs text-white text-center ${statusColor} flex items-center h-7`}
                                        >
                                            {statusText}
                                        </span>
                                        {/* Phone Call to WhatsApp */}
                                        <Fab
                                            size="small"
                                            onClick={() => {
                                                // Handle phone call to WhatsApp
                                                window.open(
                                                    `https://api.whatsapp.com/send?phone=62${order.customer.phone}`,
                                                    "_blank"
                                                );
                                            }}
                                            disabled={!order.customer.phone}
                                            className="bg-green-700 p-2 text-center flex items-center justify-center text-white rounded-full cursor-pointer shadow-none"
                                        >
                                            <PhoneIcon className="w-5 h-5" />
                                        </Fab>
                                    </div>
                                </div>
                                {/* Note for technician */}
                                {order.note && (
                                    <div className="flex items-start mt-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
                                        <img
                                            src={noteFilled}
                                            alt="noteSuccess"
                                            className="w-4"
                                        />
                                        <p className="text-gray-800 text-xs">
                                            {order.note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service Address */}
                    <div className="py-4 bg-white border-t-[1.5px] border-gray-200 pt-6">
                        <div>
                            <div className="flex items-center text-center">
                                <div className="flex gap-4 w-full">
                                    <div className="bg-red-400 w-9 h-9 rounded-full flex items-center justify-center text-center">
                                        <LocationPinIcon className="w-20 text-white" />
                                    </div>
                                    <div className="flex flex-col text-start gap-1 w-full">
                                        <div>
                                            <p className="font-semibold text-lg text-gray-700 ">
                                                {" "}
                                                {(detailAddress as any).address
                                                    .amenity ??
                                                    (detailAddress as any)
                                                        .address.road ??
                                                    (detailAddress as any)
                                                        .address.village ??
                                                    "Lokasi belum diisi"}{" "}
                                                {isLoadingRoute
                                                    ? " - Menghitung..."
                                                    : ` - ${distance}`}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-700 ">
                                                {(detailAddress as any)
                                                    .display_name ??
                                                    "Lokasi belum diisi"}
                                            </p>
                                            {/* Address Note for technician */}
                                            {order.serviceLocation.note && (
                                                <div className="flex items-center my-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
                                                    <HomeIcon className="text-green-600" />
                                                    <p className="text-gray-800 text-xs w-full">
                                                        {
                                                            order
                                                                .serviceLocation
                                                                .note
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {/* <RouteIcon className="text-green-600" /> */}

                                            {/* Property Type */}
                                            <div className="flex items-center mt-1 gap-4 text-md">
                                                <p className="font-medium text-gray-800">
                                                    {order.propertyType ||
                                                        "Tipe properti belum dipilih"}
                                                </p>
                                                <p className="text-gray-600">
                                                    Lantai{" "}
                                                    {order.propertyFloor || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* To Detail Button */}
                    <Button
                        onClick={() =>
                            navigate(`/technician/order/${order.id}/detail`)
                        }
                        className="py-4 bg-white hover:bg-gray-50 active:bg-gray-100 border-t-[1.5px] border-gray-200 pt-6 flex justify-center items-center text-base font-medium cursor-pointer w-full text-gray-900 capitalize rounded-none"
                    >
                        Lihat Pesanan
                        <ChevronRight />
                    </Button>
                    {order.status !== "cancelled" &&
                        order.status !== "completed" && (
                            <Button
                                className="w-full rounded-none bg-destructive/10 border-t-[1.5px] py-3.5 text-base hover:bg-destructive/20 text-md font-medium border-gray-200 cursor-pointer text-red-600 capitalize"
                                onClick={() => setIsCancelSheetOpen(true)}
                            >
                                Batalkan pesanan
                            </Button>
                        )}
                </ScrollArea>

                {nextAction && (
                    <SwipeButton
                        onSubmit={nextAction.action}
                        text={nextAction.text}
                        className="w-full"
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
        </div>
    );
}
