import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router";
import CustomerBottomNav from "~/components/customer/customer-bottom-nav";
import type { CustomerOrderCounts } from "~/types/order.types";

export type CustomerLayoutContext = {
    orderCounts: CustomerOrderCounts | null;
    refetchOrderCounts: () => void;
};

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [orderCounts, setOrderCounts] = useState<CustomerOrderCounts | null>(
        null
    );

    const fetchOrderCounts = useCallback(async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/orders`,
                {
                    params: { countOnly: true },
                    withCredentials: true,
                }
            );
            setOrderCounts(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil jumlah pesanan pelanggan:", error);
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
                        } satisfies CustomerLayoutContext
                    }
                />

                <CustomerBottomNav orderCounts={orderCounts!} />
            </main>
        </div>
    );
}
