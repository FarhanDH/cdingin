import ErrorIcon from "@mui/icons-material/Error";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import axios from "axios";
import { AirVent, HomeIcon, NotepadTextIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import noteFilled from "~/assets/note-filled.png";
import { formattedDate } from "~/common/utils";
import Header from "~/components/header";
import { Button } from "~/components/ui/button";
import CancelOrderSheet from "~/customer/order/cancel-order-sheet";
import { acTypes } from "~/customer/order/new/ac-unit-card";
import { getStatusLabel, type OrderItem } from "~/types/order.types";

export default function CustomerOrderDetail() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<OrderItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
    const { text: statusText, color: statusColor } = getStatusLabel(
        order?.status || "pending",
    );

    const fetchOrderDetail = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
                {
                    withCredentials: true,
                },
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
                    `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
                    {
                        withCredentials: true,
                    },
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

    if (isLoading) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <h1>{error}</h1>;
    }

    if (!order) {
        return <h1>Order not found</h1>;
    }

    return (
        <div className="">
            <Header title="Detail pesananmu" showBack showBorder={false} />

            <div className="p-2 bg-gray-100 min-h-screen flex flex-col gap-2">
                {/* Service Address */}
                <div className="p-4 bg-white rounded-xl">
                    <div className="flex items-start text-center justify-between">
                        <div className="flex items-start text-center gap-4">
                            <div className="bg-red-400 w-9 h-9 rounded-full flex items-center justify-center text-center">
                                <LocationPinIcon className="w-20 text-white" />
                            </div>
                            <p className="text-gray-700 text-sm">
                                Alamat service
                            </p>
                        </div>
                        <span
                            className={`px-3 rounded-sm text-xs text-white text-center ${statusColor} flex items-center h-7`}
                        >
                            {statusText}
                        </span>
                    </div>

                    <div className="flex ml-13 flex-col -mt-3 text-start gap-1">
                        <div>
                            <div>
                                <p className="font-semibold text-start text-xl text-gray-700 ">
                                    {order.serviceLocation.address ||
                                        "Lokasi belum diisi"}{" "}
                                </p>

                                {/* Address Note for technician */}
                                {order.serviceLocation.note && (
                                    <div className="flex items-start mt-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
                                        {/* <img
                                            src={noteFilled}
                                            alt="noteSuccess"
                                            className="w-4"
                                        /> */}
                                        <HomeIcon className="text-green-600" />
                                        <p className="text-gray-800 text-xs w-full">
                                            {order.serviceLocation.note}
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
                                        Lantai {order.propertyFloor || "-"}
                                    </p>
                                </div>
                                {/* Note for technician */}
                                {order.note && (
                                    <div className="flex items-start mt-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
                                        <img
                                            src={noteFilled}
                                            alt="noteSuccess"
                                            className="w-4 ml-0.5"
                                        />
                                        <p className="text-gray-800 text-xs">
                                            {order.note}
                                        </p>
                                    </div>
                                )}
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
                                    {order.problems?.map((problem, index) => (
                                        <li key={index}>{problem}</li>
                                    ))}
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

                {/* Button */}
                <div>
                    {order.status === "pending" && (
                        <Button
                            // variant={"destructive"}
                            // className="w-full py-6 text-base text-red-500 bg-destructive/20 hover:bg-destructive/30 text-md font-semibold cursor-pointer active:scale-95 rounded-full"
                            className="w-full py-6 text-base text-red-500 bg-destructive/20 hover:bg-destructive/30 active:bg-destructive/40 active:scale-95 transition-all duration-150 ease-in-out text-md font-semibold cursor-pointer rounded-full"
                            onClick={() => {
                                setIsCancelSheetOpen(true);
                            }}
                        >
                            Batalkan pesanan
                        </Button>
                    )}
                </div>
            </div>

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
