import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { formattedDate } from "~/common/utils";
import EarningHistoryCard from "~/components/earning/earning-history-card";
import EarningTab, {
    type EarningTabId,
} from "~/components/earning/earning-tab";
import Header from "~/components/header";
import type { OrderItem } from "~/types/order.types";
import type { Route } from "./+types/earning-history";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Riwayat Pendapatan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function EarningHistory() {
    const { date: dateString } = useParams<{ date: string }>();
    const [activeTab, setActiveTab] = useState<EarningTabId>("completed");
    const [ordersByDate, setOrdersByDate] = useState<OrderItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const date = new Date(dateString ?? "");
    const dateFormat = formattedDate(date, {});

    useEffect(() => {
        setIsLoading(true);
        if (!dateString) return;
        const fetchOrderByDate = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/orders/technician/`,
                    {
                        params: { "service-date": date },
                        withCredentials: true,
                    }
                );
                setOrdersByDate(response.data.data);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderByDate();
    }, [dateString]);

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

            {/* Earning History */}
            <div className="bg-gray-50 mt-4">
                <div className="">
                    {ordersByDate?.map((earning) => (
                        <EarningHistoryCard key={earning.id} order={earning} />
                    ))}
                </div>
            </div>
        </div>
    );
}
