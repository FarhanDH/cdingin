import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import { Button, CircularProgress } from "@mui/material";
import axios from "axios";
import cautionNote from "public/caution-note.png";
import failedNote from "public/failed-note.png";
import successNote from "public/note-success.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { customToastStyle } from "~/common/custom-toast-style";
import { formattedDate } from "~/common/utils";
import HorizontalDateScroller from "~/components/earning/horizontal-date-scroller";
import Header from "~/components/header";
import type { EarningSummary } from "~/types/earning.types";
import type { Route } from "./+types/earning";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Pendapatan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function Earning() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [earningData, setEarningData] = useState<EarningSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEarningSummary = async () => {
            setIsLoading(true);
            try {
                const dateParam = formattedDate(selectedDate, {
                    locale: "en-US",
                });
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/earnings/summary`,
                    {
                        params: { date: dateParam },
                        withCredentials: true,
                    }
                );
                setEarningData(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil ringkasan pendapatan:", error);
                toast(
                    "Gagal memuat data pendapatan. Coba lagi",
                    customToastStyle
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchEarningSummary();
    }, [selectedDate]); // <- Run each time selectedDate changes

    if (isLoading) {
        return (
            <div className="h-20 flex justify-center items-center">
                <CircularProgress size={20} className="text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <Header
                title="Pendapatan"
                isSticky={true}
                showBorder={false}
                className="bg-white w-full"
            >
                {/* Date */}
                <div className="bg-gray-50 pt-3">
                    <h1 className="text-sm text-gray-900 font-medium text-center">{`${new Date(
                        selectedDate
                    ).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                    })}`}</h1>
                    {/* Date Scroller */}
                    <HorizontalDateScroller
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        numberOfDaysToShowFromNow={30}
                    />
                </div>
            </Header>

            {/* Order Summary Card */}
            <div className="rounded-2xl w-[91%] mx-auto bg-[#c4f3ff]/15 border-2 space-y-1 flex flex-col mt-6">
                {/* Header */}
                <div className="p-4 border-b-2 bg-white rounded-t-2xl">
                    <h2 className="text-base font-medium text-gray-800">
                        Ringkasan pesanan
                    </h2>
                </div>
                <div className="rounded-2xl p-4">
                    <div className="flex items-end justify-between gap-2">
                        <div className="space-y-2 flex-grow w-full">
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {/* Completed Order */}
                                <div className="bg-white border-2 py-2 rounded-lg w-full">
                                    <div className="flex items-start justify-center gap-4">
                                        <div className="bg-green-100 rounded-lg w-10 h-10 flex items-center justify-center ">
                                            <img
                                                src={successNote}
                                                alt="history"
                                                className="w-7 h-7"
                                            />
                                        </div>
                                        <div className="mr-6">
                                            <p className="text-sm text-gray-600 text-center">
                                                {`Selesai`}
                                            </p>
                                            <p className="text-lg text-green-700 font-semibold text-center">
                                                {`${earningData?.completedOrderCount}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* Cancelled Order */}
                                <div className="bg-white border-2 py-2 rounded-lg w-full">
                                    <div className="flex items-start justify-center gap-4">
                                        <div className="bg-red-100 rounded-lg w-10 h-10 flex items-center justify-center">
                                            <img
                                                src={failedNote}
                                                alt="failed"
                                                className="w-7 h-7"
                                            />
                                        </div>
                                        <div className="mr-1">
                                            <p className="text-sm text-gray-600 text-center">
                                                {`Dibatalkan`}
                                            </p>
                                            <p className="text-lg text-red-700 font-medium text-center">
                                                {`${earningData?.cancelledOrderCount}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* Missed Order */}
                                <div className="bg-white border-2 py-2 rounded-lg w-full">
                                    <div className="flex items-start justify-center gap-4">
                                        <div className="bg-yellow-100 rounded-lg w-10 h-10 flex items-center justify-center">
                                            <img
                                                src={cautionNote}
                                                alt="failed"
                                                className="w-7 h-7"
                                            />
                                        </div>
                                        <div className="mr-3.5">
                                            <p className="text-sm text-gray-600 text-center">
                                                {`Terlewat`}
                                            </p>
                                            <p className="text-lg text-yellow-600 font-medium text-center">
                                                {`${earningData?.missedOrderCount}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* Total Order */}
                                <div className="bg-white border-2 py-2 px-4 rounded-lg w-full">
                                    <div className="w-full mx-auto text-center">
                                        <p className="text-sm text-gray-600">
                                            {`Total pesanan`}
                                        </p>
                                        <p className="text-lg text-gray-700 font-medium">
                                            {`${earningData?.orderTotal}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => {
                        navigate(
                            `/technician/earnings/histories/${selectedDate}`
                        );
                    }}
                    className="bg-primary text-white !font-[Rubik] normal-case rounded-full text-sm py-2.5 px-3 active:scale-95 mb-4 mx-4"
                >
                    Lihat detail
                </Button>
            </div>

            {/* Earning Summary Card */}
            <div className="rounded-2xl w-[91%] mx-auto bg-white border-2 space-y-1 flex flex-col p-4 mt-6 mb-6">
                {/* Header */}
                <div className="border-b-2 pb-3 bg-white rounded-t-2xl flex items-center justify-between">
                    <h2 className="text-base font-medium text-gray-800">
                        Pendapatan
                    </h2>
                    <h2 className="text-[17px] font-medium text-gray-800">
                        {`Rp${earningData?.earningTotal.toLocaleString(
                            "id-ID"
                        )}`}
                    </h2>
                </div>
                <div className="rounded-2xl pt-2">
                    <div className="flex items-end justify-around gap-2">
                        <div className="text-center space-y-1">
                            <p className="text-sm text-gray-600">Bayar tunai</p>
                            <PaymentsRoundedIcon className="text-green-600" />
                            <h2 className="text-[17px] font-medium text-gray-800">
                                {`Rp${earningData?.cashPaymentTotal.toLocaleString(
                                    "id-ID"
                                )}`}
                            </h2>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm text-gray-600">
                                Bayar transfer
                            </p>
                            <WalletRoundedIcon className="text-green-600" />
                            <h2 className="text-[17px] font-medium text-gray-800">
                                {`Rp${earningData?.digitalPaymentTotal.toLocaleString(
                                    "id-ID"
                                )}`}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
