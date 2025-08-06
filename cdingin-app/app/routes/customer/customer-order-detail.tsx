import axios from "axios";
import { AirVent, AlertCircle, MapPin, NotepadTextIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { formattedDate } from "~/common/utils";
import Header from "~/components/header";
import { Button } from "~/components/ui/button";
import { acTypes } from "~/customer/order/new/ac-unit-card";
import { getStatusLabel, type OrderItem } from "~/types/order.types";

const statusSteps = ["confirmed", "on_working", "completed", "cancelled"];

export default function CustomerOrderDetail() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<OrderItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { text: statusText, color: statusColor } = getStatusLabel(
        order?.status || "pending"
    );

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
                <div className="p-4 shadow-md bg-white rounded-lg">
                    <div className="flex items-center text-center justify-between">
                        <div className="flex items-center text-center gap-2">
                            <MapPin size={21} className="text-gray-700" />
                            <p>Alamat service</p>
                        </div>
                        <span
                            className={`px-3 rounded-sm text-xs text-white text-center ${statusColor} flex items-center h-7`}
                        >
                            {statusText}
                        </span>
                    </div>
                    <p className="font-semibold text-xl text-gray-700 flex items-center">
                        {order.serviceLocation || "Lokasi belum diisi"}{" "}
                    </p>

                    {/* Property Type */}
                    <div className="flex items-center mt-1 gap-4 text-sm rounded-lg">
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
                        <div className="flex items-center mt-2 gap-2">
                            <NotepadTextIcon
                                className=" text-muted-foreground"
                                size={18}
                            />
                            <p className="text-gray-600 text-xs">
                                {order.note}
                            </p>
                        </div>
                    )}
                </div>

                {/* AC Problems */}
                <div className="p-4 shadow-md bg-white rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 ">
                            <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center">
                                <AlertCircle className="w-10 text-yellow-500" />
                            </div>
                            <div>
                                <h1 className="font-semibold text-lg">
                                    Layanan / Keluhan
                                </h1>
                                <p className="text-xs text-gray-800">
                                    {order.problems?.join(", ") ||
                                        "Tipe layanan belum dipilih"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Unit AC */}
                <div className="p-4 shadow-md bg-white rounded-lg">
                    <div className="flex">
                        <AirVent />
                        <h1 className="text-lg font-semibold">
                            Detail Unit AC
                        </h1>
                    </div>
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
                                                        acUnit.acTypeName
                                                )?.name
                                            }{" "}
                                            {acUnit.acCapacity}
                                        </h1>
                                        <p className="text-sm font-normal text-gray-700">
                                            {acUnit.brand || "Tidak ditentukan"}
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

                {/* Order Id & Dates */}
                <div className="bg-white p-4 mb-6 shadow-md rounded-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="font-medium text-gray-700">
                            Order ID
                        </div>
                        <div className="font-medium">{order.id}</div>
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
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Tanggal service
                        </div>
                        <div className="text-sm text-gray-700">
                            {formattedDate(order.serviceDate)}
                        </div>
                    </div>
                </div>

                {/* Button */}
                <div>
                    {order.status === "pending" && (
                        <Button
                            variant={"destructive"}
                            className="w-full py-6 text-base text-md font-semibold cursor-pointer active:scale-95"
                            onClick={() => {
                                // Handle order cancellation
                            }}
                        >
                            Batalkan pesanan
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
