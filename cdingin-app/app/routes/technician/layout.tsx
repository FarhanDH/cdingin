import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import TechnicianBottomNav from "~/components/technician/technician-bottom-nav";
import type { OrderCounts } from "~/types/order.types";

export type TechnicianLayoutContext = {
    orderCounts: OrderCounts | null;
    refetchOrderCounts: () => void;
};

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [orderCounts, setOrderCounts] = useState<OrderCounts | null>(null);
    const location = useLocation();

    const fetchOrderCounts = useCallback(async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/orders/technician`,
                {
                    params: {
                        countOnly: true,
                    },
                    withCredentials: true,
                }
            );
            setOrderCounts(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil jumlah pesanan:", error);
        }
    }, []);

    useEffect(() => {
        fetchOrderCounts();
    }, [fetchOrderCounts, location.pathname]);

    return (
        <div className="pb-16">
            <main className="max-w-lg mx-auto w-full">
                <Outlet
                    context={
                        {
                            orderCounts,
                            refetchOrderCounts: fetchOrderCounts,
                        } satisfies TechnicianLayoutContext
                    }
                />

                <TechnicianBottomNav orderCounts={orderCounts} />
            </main>
        </div>
    );
}
