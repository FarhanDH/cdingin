import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import NavigationIcon from "@mui/icons-material/Navigation";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { Button, Fab } from "@mui/material";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import axios, { AxiosError } from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ErrorIcon from "@mui/icons-material/Error";
import { AirVent, MoveLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Circle,
    MapContainer,
    Marker,
    Polyline,
    TileLayer,
} from "react-leaflet";
import { useNavigate, useParams } from "react-router";
import InfoIcon from "@mui/icons-material/Info";
import { toast } from "sonner";
import mapPin from "~/assets/map-pin.png";
import noteFilled from "~/assets/note-filled.png";
import phoneWhatsapp from "~/assets/whatsapp-telephone.png";
import { customToastStyle } from "~/common/custom-toast-style";
import {
    calculateDistanceInMeters,
    formattedDate,
    prettyDate,
} from "~/common/utils";
import EnableLocationSheet from "~/components/enable-location-sheet";
import ReceiptIcon from "@mui/icons-material/Receipt";
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
import { formatDistance, subDays } from "date-fns";
import { id } from "date-fns/locale";
import { acTypes } from "~/customer/order/new/ac-unit-card";

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
    const [detailAddress, setDetailAddress] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [isPhoneSheetOpen, setIsPhoneSheetOpen] = useState(false);
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

    // Show the phone sheet only if the order status is "pending"
    useEffect(() => {
        if (order?.status === "pending") {
            setIsPhoneSheetOpen(true);
        }
    }, [order?.status]);

    const nextAction = getNextAction();

    const zoomValue = () => {
        const distance = calculateDistanceInMeters(
            {
                lat: technicianPosition?.lat,
                lng: technicianPosition?.lng,
            },
            {
                lat: order?.serviceLocation.latitude,
                lng: order?.serviceLocation.longitude,
            }
        );
        if (distance > 1000) {
            return 12;
        }
        return 17;
    };

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
        <div className="">
            {isLoading && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-40">
                    <Spinner size={30} className="text-primary" />
                </div>
            )}

            {/* Map */}
            <div className="w-full">
                <MapContainer
                    center={[
                        order.serviceLocation.latitude,
                        order.serviceLocation.longitude,
                    ]}
                    zoom={zoomValue()}
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
                            />
                        </>
                    )}
                    {/* Service location marker */}
                    {serviceLocationPosition && (
                        <Marker
                            position={serviceLocationPosition}
                            icon={mapPinIcon}
                        />
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
                noBodyStyles={true}
                snapPoints={[0.4, 1]}
                activeSnapPoint={0.4}
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

                    {/* Top right buttons */}
                    <div className="absolute -top-33 right-4 flex flex-col items-center gap-6">
                        {/* Request current location */}
                        <Fab
                            size="medium"
                            className="z-10 bg-gray-50 p-2 rounded-full shadow-md cursor-pointer"
                            onClick={requestLocation}
                        >
                            <GpsFixedIcon className="text-gray-700" />
                        </Fab>

                        {/* Navigation button */}
                        <Fab
                            size="medium"
                            className="z-10 bg-secondary p-2 text-center rounded-full shadow-md cursor-pointer"
                            onClick={() => {
                                window.open(
                                    `https://www.google.com/maps/dir/?api=1&origin=${technicianPosition?.lat},${technicianPosition?.lng}&destination=${order.serviceLocation.latitude},${order.serviceLocation.longitude}`,
                                    "_blank"
                                );
                            }}
                        >
                            <NavigationIcon
                                className="text-white rotate-45"
                                fontSize="medium"
                            />
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
                                time: false,
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

                            {/* Service Address */}
                            <div className="p-4 bg-white pt-6 rounded-3xl shadow-xs  border-gray-200 border">
                                <div>
                                    <div className="flex items-center text-center">
                                        <div className="flex gap-4 w-full">
                                            <div className="bg-red-400 w-9 h-9 rounded-full flex items-center justify-center text-center">
                                                <LocationPinIcon className="w-20 text-white" />
                                            </div>
                                            <div className="flex flex-col text-start w-full">
                                                <div>
                                                    <p className="text-gray-700 text-[13px] font-medium mb-2">
                                                        {isLoadingRoute
                                                            ? "Menghitung jarak..."
                                                            : `${
                                                                  distance
                                                                      ? `${distance} dari lokasimu`
                                                                      : "Lokasimu tidak ditemukan"
                                                              }`}
                                                    </p>
                                                    <p className="font-medium text-lg text-gray-800">
                                                        {" "}
                                                        {(detailAddress as any)
                                                            .address.amenity ??
                                                            (
                                                                detailAddress as any
                                                            ).address.road ??
                                                            (
                                                                detailAddress as any
                                                            ).address.village ??
                                                            "Lokasi belum diisi"}{" "}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-700 ">
                                                        {(detailAddress as any)
                                                            .display_name ??
                                                            "Lokasi belum diisi"}
                                                    </p>
                                                    {/* Address Note for technician */}
                                                    {order.serviceLocation
                                                        .note && (
                                                        <div className="flex items-center my-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
                                                            <HomeFilledIcon className="text-green-600" />
                                                            <p className="text-gray-800 text-xs w-full">
                                                                {
                                                                    order
                                                                        .serviceLocation
                                                                        .note
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Property Type */}
                                                    <div className="flex items-center mt-1 gap-4 text-sm">
                                                        <p className="font-medium text-gray-800">
                                                            {order.propertyType ||
                                                                "Tipe properti belum dipilih"}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            Lantai{" "}
                                                            {order.propertyFloor ||
                                                                "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AC Problems */}
                            <div className="p-4 bg-white rounded-3xl shadow-xs border border-gray-200">
                                <div className="flex items-center text-start">
                                    <div className="flex gap-4">
                                        <div className="bg-orange-300 w-9 h-9 rounded-full flex items-center justify-center text-center">
                                            <ErrorIcon className="w-20 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="font-medium text-lg text-gray-800">
                                                Layanan / Keluhan
                                            </h1>
                                            <ul className="list-disc ml-4 text-sm text-gray-800">
                                                {order.problems?.map(
                                                    (problem, index) => (
                                                        <li key={index}>
                                                            {problem}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Unit AC */}
                            <div className="p-4 bg-white rounded-3xl shadow-xs border border-gray-200">
                                <div className="flex items-start text-start gap-4">
                                    <div className="bg-primary w-9 h-9 rounded-full flex items-center justify-center text-center">
                                        <AirVent className="text-white w-18" />
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <h1 className="text-gray-700 text-sm mb-2">
                                            Detail Unit AC
                                        </h1>
                                        {order.acUnits.map((acUnit, index) => (
                                            <div key={acUnit.id}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <h1 className="font-medium text-sm">
                                                                {
                                                                    acTypes.find(
                                                                        (
                                                                            type
                                                                        ) =>
                                                                            type.id ===
                                                                            acUnit.acTypeName
                                                                    )?.name
                                                                }{" "}
                                                                {
                                                                    acUnit.acCapacity
                                                                }
                                                            </h1>
                                                            <p className="text-sm font-normal text-gray-700">
                                                                {acUnit.brand ||
                                                                    "Tidak ditentukan"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="font-normal text-sm w-4 text-center text-gray-700">
                                                        {acUnit.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="border-t-[1.5px] border-gray-150 mx-auto w-full">
                                            <div className="mt-2 flex items-center justify-between">
                                                <h1 className="font-medium text-sm">
                                                    Total Unit
                                                </h1>
                                                <span className="text-sm text-center font-medium w-4">
                                                    {order.totalUnits}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="bg-white p-4 rounded-3xl shadow-xs border border-gray-200">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-xs text-gray-700">
                                        Tanggal service
                                    </div>
                                    <div className="text-xs text-gray-700">
                                        {formattedDate(order.serviceDate, {
                                            time: false,
                                        })}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-gray-700">
                                        Waktu pemesanan
                                    </div>
                                    {/* Created time */}
                                    <div className="text-xs text-gray-700">
                                        {formattedDate(order.createdAt, {
                                            time: true,
                                        })}
                                    </div>
                                </div>

                                {order.updatedAt !== order.createdAt && (
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs text-gray-700">
                                            Waktu diperbarui
                                        </div>
                                        <div className="text-xs text-gray-700">
                                            {formattedDate(order.updatedAt, {
                                                time: true,
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

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
                            // Handle phone call to WhatsApp
                            window.open(
                                `https://api.whatsapp.com/send?phone=62${order.customer.phone}`,
                                "_blank"
                            );
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

                {nextAction && (
                    <SwipeButton
                        onSubmit={nextAction.action}
                        text={nextAction.text}
                        className="w-full absolute max-w-lg bottom-0 left-0 right-0 mx-auto bg-primary z-50 mb-4"
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
                            Pastiin hubungin pelanggan dulu!
                        </SheetTitle>
                        <SheetDescription className="text-[16px] text-gray-600">
                            Sebelum terima pesanan, pastiin dulu pesanan
                            pelanggan lewat telepon atau WhatsApp ya
                        </SheetDescription>
                        <Button
                            onClick={() => setIsPhoneSheetOpen(false)}
                            className="bg-primary text-base text-white normal-case !font-[Rubik] w-full h-12 rounded-full text-md font-semibold mt-6 active:scale-95"
                        >
                            Oke, siap
                        </Button>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </div>
    );
}
