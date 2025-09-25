import ErrorIcon from "@mui/icons-material/Error";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import { Button } from "@mui/material";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import axios from "axios";
import L, { latLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { AirVent, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useNavigate, useParams } from "react-router";
import cashImage from "~/assets/cash.png";
import mapPin from "~/assets/map-pin.png";
import noteFilled from "~/assets/note-filled.png";
import { formattedDate } from "~/common/utils";
import Header from "~/components/header";
import { Drawer, DrawerContent, DrawerHeader } from "~/components/ui/drawer";
import { ScrollArea } from "~/components/ui/scroll-area";
import Spinner from "~/components/ui/spinner";
import CancelOrderSheet from "~/customer/order/cancel-order-sheet";
import { acTypes } from "~/customer/order/new/ac-unit-card";
import { getStatusLabel, type OrderItem } from "~/types/order.types";
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
    const { text: statusText, bgColor: statusColor } = getStatusLabel(
        order?.status || "pending"
    );
    const [serviceAddress, setServiceAddress] = useState<string>("");
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

    // Get address
    const getDetailAddress = async () => {
        try {
            const response = await axios.get(
                "https://nominatim.openstreetmap.org/reverse",
                {
                    params: {
                        lat: order?.serviceLocation.latitude,
                        lon: order?.serviceLocation.longitude,
                        format: "json",
                    },
                }
            );
            setServiceAddress(
                response.data.display_name || "Alamat tidak ditemukan"
            );
        } catch {
            setServiceAddress("Gagal mendapatkan alamat");
        }
    };

    useEffect(() => {
        if (order) {
            getDetailAddress();
        }
    }, [order]);

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
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                activeSnapPoint={0.4}
                modal={false}
            >
                <DrawerContent
                    className={`max-w-lg mx-auto rounded-t-3xl z-10 h-[90%] ${
                        order.invoiceId &&
                        order.status !== "completed" &&
                        "mb-30"
                    } ${
                        order.invoiceId &&
                        order.status === "completed" &&
                        "mb-10"
                    }`}
                    isOverlay={false}
                >
                    <DrawerHeader className="bg-white flex items-center">
                        {/* <DrawerTitle className="text-base font-bold text-gray-800"> */}
                        <span
                            className={`px-3 rounded-sm w-fit text-xs text-white text-center ${statusColor} flex justify-center items-center h-7`}
                        >
                            <p>{statusText}</p>
                        </span>
                        {/* </DrawerTitle> */}
                    </DrawerHeader>

                    <ScrollArea
                        className={`flex-grow overflow-y-auto bg-gray-100`}
                        showScrollBar={false}
                    >
                        <div className="p-4 flex flex-col gap-2">
                            {/* Service Address */}
                            <div className="p-4 bg-white rounded-xl shadow-xs border border-gray-200">
                                <div className="flex items-start text-center justify-between">
                                    <div className="flex items-start text-center gap-4">
                                        <div className="bg-red-400 w-9 h-9 rounded-full flex items-center justify-center text-center">
                                            <LocationPinIcon className="w-20 text-white" />
                                        </div>
                                        <p className="text-gray-700 text-sm">
                                            Alamat service
                                        </p>
                                    </div>
                                </div>

                                <div className="flex ml-13 flex-col -mt-3 text-start gap-1">
                                    <div>
                                        <div>
                                            <p className="font-semibold text-start text-lg text-gray-800 ">
                                                {order.serviceLocation
                                                    .address ||
                                                    "Lokasi belum diisi"}{" "}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-700 ">
                                                {(serviceAddress as any) ??
                                                    "Lokasi belum diisi"}
                                            </p>

                                            {/* Address Note for technician */}
                                            {order.serviceLocation.note && (
                                                <div className="flex items-start mt-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
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
                                                    {order.propertyFloor || "-"}
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
                            <div className="p-4 bg-white rounded-xl shadow-xs border border-gray-200">
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
                            <div className="p-4 bg-white rounded-xl shadow-xs border border-gray-200">
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
                            <div className="bg-white p-4 mb-6 rounded-xl shadow-xs border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="font-medium">Order ID</div>
                                    <div className="font-medium">
                                        {order.id}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-xs text-gray-700">
                                        Tanggal service
                                    </div>
                                    <div className="text-xs text-gray-700">
                                        {formattedDate(order.serviceDate, {
                                            withTime: false,
                                        })}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-xs text-gray-700">
                                        Waktu pemesanan
                                    </div>
                                    {/* Created time */}
                                    <div className="text-xs text-gray-700">
                                        {formattedDate(order.createdAt, {
                                            withTime: true,
                                        })}
                                    </div>
                                </div>

                                {order.updatedAt !== order.createdAt && (
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-xs text-gray-700">
                                            Waktu diperbarui
                                        </div>
                                        <div className="text-xs text-gray-700">
                                            {formattedDate(order.updatedAt, {
                                                withTime: true,
                                            })}
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
                    </ScrollArea>
                </DrawerContent>
            </Drawer>

            {/* Invoice Button */}
            {order.invoiceId && (
                <div
                    className={`w-full px-4 ${
                        order.status !== "completed" && "bg-white"
                    } gap-4 fixed bottom-0 max-w-lg mx-auto z-50`}
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
