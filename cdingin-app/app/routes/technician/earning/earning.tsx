import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import { Button, CircularProgress } from "@mui/material";
import {
    addMonths,
    addWeeks,
    format,
    endOfMonth,
    endOfWeek,
    startOfWeek,
    subMonths,
    subWeeks,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

type Period = "daily" | "weekly" | "monthly";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Pendapatan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

/**
 * Earning page component for technicians.
 * Displays a summary of earnings and order statistics for a selected period (daily, weekly, monthly).
 */
export default function Earning() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [period, setPeriod] = useState<Period>("daily");
    const [earningData, setEarningData] = useState<EarningSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Fetches the earning summary from the API whenever the selected date or period changes.
         */
        const fetchEarningSummary = async () => {
            setIsLoading(true);
            try {
                const dateParam = formattedDate(selectedDate, {
                    locale: "en-US",
                });
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/earnings/summary`,
                    {
                        params: { date: dateParam, period },
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
    }, [selectedDate, period]); // <- Run each time selectedDate or period changes

    /**
     * Handles changing the time period (daily, weekly, monthly) and resets the date to today.
     * @param newPeriod - The new period to set.
     */
    const handlePeriodChange = (newPeriod: Period) => {
        setPeriod(newPeriod);
        // Reset date to today when changing period to avoid confusion
        setSelectedDate(new Date());
    };

    /**
     * Renders the appropriate date selector UI based on the current period.
     * @returns A JSX element for date selection.
     */
    const renderDateSelector = () => {
        if (period === "daily") {
            return (
                <HorizontalDateScroller
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    numberOfDaysToShowFromNow={30}
                />
            );
        }

        const isWeekly = period === "weekly";
        const prevDate = isWeekly
            ? subWeeks(selectedDate, 1)
            : subMonths(selectedDate, 1);
        const nextDate = isWeekly
            ? addWeeks(selectedDate, 1)
            : addMonths(selectedDate, 1);

        let periodLabel = "";
        if (isWeekly) {
            const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
            periodLabel = `${format(weekStart, "d MMM", {
                locale: id,
            })} - ${format(weekEnd, "d MMM yyyy", { locale: id })}`;
        } else {
            // monthly
            periodLabel = format(selectedDate, "MMMM yyyy", { locale: id });
        }

        return (
            <div className="flex items-center justify-between px-4 py-2">
                <Button
                    onClick={() => setSelectedDate(prevDate)}
                    className="min-w-0 p-2 rounded-full"
                >
                    <ChevronLeft />
                </Button>
                <span className="font-semibold text-gray-800">
                    {periodLabel}
                </span>
                <Button
                    onClick={() => setSelectedDate(nextDate)}
                    className="min-w-0 p-2 rounded-full"
                >
                    <ChevronRight />
                </Button>
            </div>
        );
    };

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
                {/* Period Tabs */}
                <div className="flex justify-center bg-gray-100 p-1 rounded-full mx-4">
                    {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
                        <Button
                            key={p}
                            onClick={() => handlePeriodChange(p)}
                            className={`flex-1 rounded-full normal-case !font-[Rubik] ${
                                period === p
                                    ? "bg-primary text-white shadow"
                                    : "bg-transparent text-gray-600"
                            }`}
                        >
                            {p === "daily"
                                ? "Harian"
                                : p === "weekly"
                                ? "Mingguan"
                                : "Bulanan"}
                        </Button>
                    ))}
                </div>

                {/* Date Selector */}
                <div className="bg-gray-50 pt-1">{renderDateSelector()}</div>
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
                            `/technician/earnings/histories/${selectedDate.toISOString()}?period=${period}`
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
