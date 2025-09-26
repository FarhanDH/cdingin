import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { formattedDate } from "~/common/utils";
import EarningHistoryCard from "~/components/earning/earning-history-card";
import EarningTab, {
    type EarningTabId,
} from "~/components/earning/earning-tab";
import Header from "~/components/header";
import successNote from "~/assets/note-success.png";
import failedNote from "~/assets/failed-note.png";
import cautionNote from "~/assets/caution-note.png";
import type { OrderItem } from "~/types/order.types";
import type { Route } from "./+types/earning-history";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Riwayat Pendapatan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

const EmptyState = ({ activeTab }: { activeTab: EarningTabId }) => {
    const emptyStateContent = {
        completed: {
            img: successNote,
            title: "Belum ada yang kelar",
            description:
                "Semangat! Selesaikan pesanan biar dompet makin tebal.",
        },
        cancelled: {
            img: failedNote,
            title: "Aman, gak ada yang batal",
            description: "Semua pesanan lancar jaya. Pertahankan, ya!",
        },
        missed: {
            img: cautionNote,
            title: "Kerja bagus!",
            description:
                "Gak ada pesanan yang kelewat. Kamu emang teknisi andalan!",
        },
    };

    const { img, title, description } = emptyStateContent[activeTab];

    return (
        <div className="mt-20 flex flex-col items-center text-center p-4">
            <img src={img} alt={title} className="w-24 mb-4" />
            <h1 className="font-semibold text-lg text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500 max-w-xs">{description}</p>
        </div>
    );
};

export default function EarningHistory() {
    const { date: dateString } = useParams<{ date: string }>();
    const [activeTab, setActiveTab] = useState<EarningTabId>("completed");
    const [ordersByDate, setOrdersByDate] = useState<OrderItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const date = new Date(dateString ?? "");
    const dateFormat = formattedDate(date, {});
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        if (!dateString) return;
        /**
         * Fetches orders by date and status from the API.
         *
         * @remarks
         * If the API returns a 401 error, it will redirect to the login page.
         * If any other error occurs, it will be logged to the console.
         */
        const fetchOrderByDate = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/orders/technician`,
                    {
                        params: { "service-date": date, status: activeTab },
                        withCredentials: true,
                    }
                );
                setOrdersByDate(response.data.data);
            } catch (error) {
                console.error(error);
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 401
                ) {
                    navigate("/login");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderByDate();
    }, [dateString, activeTab]);

    return (
        <div>
            <Header
                title={dateFormat}
                isSticky={true}
                showBack
                className="bg-white w-full"
                navigateTo="/technician/earnings"
            >
                <EarningTab
                    tabs={[
                        {
                            label: "Selesai",
                            id: "completed",
                        },
                        {
                            label: "Dibatalkan",
                            id: "cancelled",
                        },
                        {
                            label: "Terlewat",
                            id: "missed",
                        },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </Header>

            {isLoading && (
                <div className="flex flex-col items-center justify-center fixed top-0 left-0 right-0 bottom-0">
                    <CircularProgress size={30} className="text-primary" />
                    <p className="text-gray-500 mt-2">
                        Lagi ngambil data, sebentar ya...
                    </p>
                </div>
            )}

            {/* Earning History */}
            <div className="mt-4">
                {!isLoading && ordersByDate && ordersByDate.length > 0 ? (
                    <div className="bg-gray-50 h-full">
                        {ordersByDate.map((earning) => (
                            <EarningHistoryCard
                                key={earning.id}
                                order={earning}
                            />
                        ))}
                    </div>
                ) : (
                    !isLoading && <EmptyState activeTab={activeTab} />
                )}
            </div>
        </div>
    );
}
