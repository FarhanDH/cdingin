import ErrorIcon from "@mui/icons-material/Error";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Fab } from "@mui/material";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { AirVent, HomeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import noteFilled from "~/assets/note-filled.png";
import { formattedDate } from "~/common/utils";
import Header from "~/components/header";
import Spinner from "~/components/ui/spinner";
import CancelOrderSheet from "~/customer/order/cancel-order-sheet";
import { acTypes } from "~/customer/order/new/ac-unit-card";
import { getStatusLabel, type OrderItem } from "~/types/order.types";

export default function TechnicianOrderDetail() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<OrderItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
    const [detailAddress, setDetailAddress] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const { text: statusText, color: statusColor } = getStatusLabel(
        order?.status || "pending",
    );

    const fetchOrderDetail = async () => {
        try {
            const orderData = await axios.get(
                `${import.meta.env.VITE_API_URL}/orders/technician/${orderId}`,
                {
                    withCredentials: true,
                },
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
                    },
                );
                const detailLocation = await axios.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    {
                        params: {
                            lat: response.data.data.serviceLocation.latitude,
                            lon: response.data.data.serviceLocation.longitude,
                            format: "json",
                        },
                    },
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
            <Header
                title="Detail pesanan"
                isSticky={true}
                showBack
                navigateTo={`/technician/order/${order.id}`}
            />

            <div className="flex-1 overflow-y-auto pt-1 pb-6 scroll-smooth overscroll-behavior-contain bg-gray-100">
                {/* Order Content */}
                <div className="p-4 min-h-screen flex flex-col gap-2">
                    {/* Customer Card */}
                    <div className="p-4 bg-white rounded-xl">
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
                                        <p className="font-semibold text-xl text-gray-700 flex items-center">
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
                                                    "_blank",
                                                );
                                            }}
                                            disabled={!order.customer.phone}
                                            className="bg-green-700 p-2 text-center flex items-center justify-center text-white rounded-full cursor-pointer shadow-none z-0"
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

                        {/* Cancellation detail */}
                        {order.status === "cancelled" && (
                            <div className="ml-13">
                                <div className="flex items-center">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <p className="text-gray-700 text-sm">
                                                Dibatalkan oleh{" "}
                                                {order.cancelledBy?.role ===
                                                "customer"
                                                    ? "pelanggan"
                                                    : "teknisi"}
                                            </p>
                                            <p className="text-gray-900 font-medium text-sm">
                                                Alasan dibatalkan:
                                            </p>
                                            <p className="text-gray-900 font-medium text-sm">
                                                {order.cancellationReason}
                                            </p>
                                        </div>
                                    </div>
                                    {order.cancellationNote && (
                                        <p className="text-gray-900 font-medium text-sm">
                                            {order.cancellationNote}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Service Address */}
                    <div className="p-4 bg-white rounded-xl">
                        <div className="flex items-center text-center">
                            <div className="flex gap-4 w-full">
                                <div className="bg-red-400 w-9 h-9 rounded-full flex items-center justify-center text-center">
                                    <LocationPinIcon className="w-20 text-white" />
                                </div>
                                <div className="flex flex-col text-start gap-1 w-full">
                                    <p className="text-gray-700 text-sm">
                                        Alamat service
                                    </p>
                                    <div>
                                        <p className="font-semibold text-lg text-gray-700 ">
                                            {(detailAddress as any).address
                                                .amenity ??
                                                (detailAddress as any).address
                                                    .road ??
                                                (detailAddress as any).address
                                                    .village ??
                                                "Lokasi belum diisi"}{" "}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-700 ">
                                            {(detailAddress as any)
                                                .display_name ??
                                                "Lokasi belum diisi"}
                                        </p>
                                        {/* Address Note for technician */}
                                        {order.serviceLocation.note && (
                                            <div className="flex items-center my-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
                                                <HomeIcon className="text-green-700" />
                                                <p className="text-gray-800 text-xs w-full">
                                                    {order.serviceLocation.note}
                                                </p>
                                            </div>
                                        )}

                                        {/* Property Type */}
                                        <div className="flex items-center mt-1 gap-4 text-md">
                                            <p className="font-medium text-gray-800">
                                                {order.propertyType ||
                                                    "Tipe properti belum dipilih"}
                                            </p>
                                            <p className="text-gray-700">
                                                Lantai{" "}
                                                {order.propertyFloor || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AC Problems */}
                    <div className="p-4 bg-white rounded-xl">
                        <div className="flex items-center text-start">
                            <div className="flex gap-4">
                                <div className="bg-orange-300 w-9 h-9 rounded-full flex items-center justify-center text-center">
                                    <ErrorIcon className="w-20 text-white" />
                                </div>
                                <div>
                                    <h1 className="font-semibold text-lg">
                                        Layanan / Keluhan
                                    </h1>
                                    <ul className="list-disc ml-4 text-sm text-gray-800">
                                        {order.problems?.map(
                                            (problem, index) => (
                                                <li key={index}>{problem}</li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detail Unit AC */}
                    <div className="p-4 bg-white rounded-xl">
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
                                                    <h1 className="font-medium text-md">
                                                        {
                                                            acTypes.find(
                                                                (type) =>
                                                                    type.id ===
                                                                    acUnit.acTypeName,
                                                            )?.name
                                                        }{" "}
                                                        {acUnit.acCapacity}
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
                                        <h1 className="font-semibold text-md">
                                            Total Unit
                                        </h1>
                                        <span className="text-sm text-center font-semibold w-4">
                                            {order.totalUnits}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Id & Dates */}
                    <div className="bg-white p-4 mb-6 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div className="font-medium">Order ID</div>
                            <div className="font-medium">{order.id}</div>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <div className="text-sm text-gray-700">
                                Tanggal service
                            </div>
                            <div className="text-sm text-gray-700">
                                {formattedDate(order.serviceDate)}
                            </div>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <div className="text-sm text-gray-700">
                                Waktu pemesanan
                            </div>
                            {/* Created time */}
                            <div className="text-sm text-gray-700">
                                {formattedDate(order.createdAt, true)}
                            </div>
                        </div>

                        {order.updatedAt !== order.createdAt && (
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-700">
                                    Waktu diperbarui
                                </div>
                                <div className="text-sm text-gray-700">
                                    {formattedDate(order.updatedAt, true)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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
        </div>
    );
}
