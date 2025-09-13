import ErrorIcon from "@mui/icons-material/Error";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import { Button } from "@mui/material";
import axios from "axios";
import { AirVent, HomeIcon, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import noteFilled from "~/assets/note-filled.png";
import { formattedDate } from "~/common/utils";
import Header from "~/components/header";
import CancelOrderSheet from "~/customer/order/cancel-order-sheet";
import { acTypes } from "~/customer/order/new/ac-unit-card";
import { getStatusLabel, type OrderItem } from "~/types/order.types";
import cashImage from "~/assets/cash.png";
import Spinner from "~/components/ui/spinner";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import type { Route } from "./+types/customer-order-detail";

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
    const { text: statusText, color: statusColor } = getStatusLabel(
        order?.status || "pending"
    );
    const navigate = useNavigate();

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
        return (
            <div
                className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 ${
                    isLoading ? "bg-black/20" : ""
                }`}
            >
                <Dialog open={isLoading} modal>
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
        return <h1>Order not found</h1>;
    }

    return (
        <div className="">
            <Header
                title="Detail pesananmu"
                showBack
                isSticky
                showBorder={false}
            />

            <div className="p-2 min-h-screen bg-gray-100 flex flex-col gap-2">
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
                                                                acUnit.acTypeName
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
                            {formattedDate(order.serviceDate, { time: false })}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                        <div className="text-sm text-gray-700">
                            Waktu pemesanan
                        </div>
                        {/* Created time */}
                        <div className="text-sm text-gray-700">
                            {formattedDate(order.createdAt, { time: true })}
                        </div>
                    </div>

                    {order.updatedAt !== order.createdAt && (
                        <div className="flex justify-between items-center mb-1">
                            <div className="text-sm text-gray-700">
                                Waktu diperbarui
                            </div>
                            <div className="text-sm text-gray-700">
                                {formattedDate(order.updatedAt, { time: true })}
                            </div>
                        </div>
                    )}
                </div>

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

            {order.invoiceId && (
                <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t-2 p-4 space-y-3 rounded-t-3xl z-50 shadow-card border-x-2">
                    {order.status !== "completed" && (
                        <>
                            <h1 className="text-lg font-semibold">
                                Tagihan Udah Siap!
                            </h1>
                            <div className="flex items-center gap-2">
                                <img
                                    src={cashImage}
                                    alt="cash"
                                    className="w-6 h-6"
                                />
                                <p className="text-sm text-gray-600">
                                    Pembayaran bisa dengan tunai, atau digital
                                    lohh
                                </p>
                            </div>
                        </>
                    )}
                    <Button
                        onClick={() => navigate(`/order/${orderId}/invoice`)}
                        className="w-full h-12 rounded-full text-base font-medium flex items-center justify-center bg-primary text-white capitalize !font-[Rubik] active:scale-95"
                    >
                        <Wallet size={20} className="mr-2" />
                        {order.status === "completed"
                            ? "Lihat tagihan"
                            : "Lihat & bayar tagihan"}
                    </Button>
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
