import ErrorIcon from "@mui/icons-material/Error";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import axios, { AxiosError } from "axios";
import { AirVent, MoveLeft, NotepadTextIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { formattedDate } from "~/common/utils";
import { Button } from "~/components/ui/button";
import { Drawer, DrawerContent } from "~/components/ui/drawer";
import Spinner from "~/components/ui/spinner";
import SwipeButton from "~/components/ui/swipe-button";
import CancelOrderSheet from "~/customer/order/cancel-order-sheet";
import { acTypes } from "~/customer/order/new/ac-unit-card";
import {
    getStatusLabel,
    type OrderItem,
    type OrderStatus,
} from "~/types/order.types";

export const customToastStyle = {
    style: {
        backgroundColor: "#242424",
        color: "#fff",
        opacity: "0.9",
        borderRadius: "20px",
        padding: "10px",
        fontSize: "16px",
        justifyContent: "center",
        border: "none",
    },
};

export default function CustomerOrderDetail() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<OrderItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { text: statusText, color: statusColor } = getStatusLabel(
        order?.status || "pending"
    );

    const fetchOrderDetail = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/orders/technician/${orderId}`,
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
                    `Sip!, orderan diterima! Pelanggan udah dikabarin. 👍`,
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
                toast(`Oke, mulai dikerjain. Semangat! 💪`, customToastStyle);
                break;

            case "waiting_payment":
                // dipanggil setelah teknisi membuat tagihan
                toast(`Kerjaan beres! Tagihan udah siap. 💸`, customToastStyle);
                break;

            case "completed":
                // dipicu oleh sistem setelah customer bayar
                toast(
                    `Lunas! Orderan selesai. Kerja bagus! ✨`,
                    customToastStyle
                );
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
                { status: newStatus }, // Body request
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

    // Handle update button based on order status
    const getNextAction = () => {
        if (!order) return null;

        switch (order.status) {
            case "confirmed":
                return {
                    text: "Berangkat ke lokasi",
                    action: () => updateOrderStatus("technician_on_the_way"),
                };
            case "technician_on_the_way":
                return {
                    text: "Udah ketemu pelanggan",
                    action: () => updateOrderStatus("on_working"),
                };
            case "on_working":
                // navigasi ke halaman pembuatan tagihan
                return {
                    text: "Geser untuk Buat Tagihan",
                    action: () => {
                        // navigate(`/technician/order/${order.id}/invoice`);
                    },
                };
            default:
                return null;
        }
    };

    const nextAction = getNextAction();

    const handleAcceptOrder = () => {
        updateOrderStatus("confirmed");
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
        <div className="relative">
            {isLoading && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <Spinner size={30} className="text-primary" />
                </div>
            )}

            <Drawer open={true}>
                <DrawerContent className="max-w-lg mx-auto flex flex-col min-h-100 bg-[#f0f0f0]">
                    {/* Top left back button */}
                    <div className="absolute -top-12 left-4 flex items-center gap-2">
                        <button
                            className="py-2 text-sm text-gray-700 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-all duration-150 ease-in-out cursor-pointer"
                            onClick={() => window.history.back()}
                        >
                            <MoveLeft className="w-10" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-1 pb-6 scroll-smooth overscroll-behavior-contain">
                        {/* Order Content */}
                        <div className="p-4 min-h-screen flex flex-col gap-2">
                            {/* Customer Card */}
                            <div className="p-4 bg-white rounded-xl">
                                <div className="flex items-center text-center justify-between">
                                    <div className="flex text-center gap-4 mb-5">
                                        <div className="mb-2 bg-blue-400 w-9 h-9 rounded-full flex items-center text-center justify-center">
                                            <PersonIcon className="text-white w-20" />
                                        </div>
                                        <div className="flex flex-col text-start gap-1">
                                            <p className="text-gray-700 text-sm">
                                                Dipesan oleh
                                            </p>
                                            <p className="font-semibold text-xl text-gray-700 flex items-center">
                                                {order.customer.fullName ||
                                                    "Tidak ada nama"}{" "}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end text-end gap-2 justify-end">
                                        {/* Order status badge */}
                                        <span
                                            className={`px-3 rounded-sm text-xs text-white text-center ${statusColor} flex items-center h-7`}
                                        >
                                            {statusText}
                                        </span>
                                        {/* Phone Call to WhatsApp */}
                                        <button
                                            onClick={() => {
                                                // Handle phone call to WhatsApp
                                                window.open(
                                                    `https://api.whatsapp.com/send?phone=62${order.customer.phone}`,
                                                    "_blank"
                                                );
                                            }}
                                            disabled={!order.customer.phone}
                                            className="bg-green-700 p-2 text-center flex items-center justify-center text-white rounded-full cursor-pointer active:scale-95"
                                        >
                                            <PhoneIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Cancellation detail */}
                                {order.status === "cancelled" && (
                                    <div className="ml-13">
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
                                        {order.cancellationNote && (
                                            <p className="text-gray-900 font-medium text-sm">
                                                {order.cancellationNote}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Service Address */}
                            <div className="p-4 bg-white rounded-xl">
                                <div className="flex items-center text-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="bg-red-400 w-9 h-9 rounded-full flex items-center justify-center text-center">
                                            <LocationPinIcon className="w-20 text-white" />
                                        </div>
                                        <div className="flex flex-col text-start gap-1">
                                            <p className="text-gray-700 text-sm">
                                                Alamat service
                                            </p>
                                            <div>
                                                <p className="font-semibold text-xl text-gray-700 ">
                                                    {order.serviceLocation ||
                                                        "Lokasi belum diisi"}{" "}
                                                </p>

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

                                {/* Note for technician */}
                                {order.note && (
                                    <div className="flex items-start mt-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
                                        <NotepadTextIcon className="text-green-500 w-5" />
                                        <p className="text-gray-800 text-sm">
                                            {order.note}
                                        </p>
                                    </div>
                                )}
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
                                    <div className="font-medium">
                                        {order.id}
                                    </div>
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
                                            {formattedDate(
                                                order.updatedAt,
                                                true
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div
                        className={`w-full p-4 gap-4 flex flex-col fixed bottom-0 max-w-lg mx-auto ${
                            order.status === "cancelled" ? "hidden" : "bg-white"
                        } border`}
                    >
                        {order.status === "pending" && (
                            <div className="flex justify-center items-center gap-8 px-2">
                                <Button
                                    variant={"destructive"}
                                    className="w-1/2 py-6 text-base text-md font-semibold cursor-pointer active:scale-95"
                                    onClick={() => setIsCancelSheetOpen(true)}
                                >
                                    Tolak
                                </Button>
                                <Button
                                    className="w-1/2 py-6 text-base text-md font-semibold cursor-pointer active:scale-95"
                                    disabled={isUpdating}
                                    onClick={handleAcceptOrder}
                                >
                                    {/* Terima */}
                                    {isUpdating ? (
                                        <Spinner
                                            size={20}
                                            className="text-primary"
                                        />
                                    ) : (
                                        "Terima"
                                    )}
                                </Button>
                            </div>
                        )}
                        {nextAction && (
                            <SwipeButton
                                onSubmit={nextAction.action}
                                text={nextAction.text}
                                className="w-full"
                            />
                        )}
                    </div>
                </DrawerContent>
            </Drawer>

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
