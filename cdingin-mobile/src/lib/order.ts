import { OrderStatus } from "../types/order";

export const getStatusLabel = (status: OrderStatus) => {
    const statusMap: Record<
        OrderStatus,
        { text: string; bgColor: string; textColor: string }
    > = {
        pending: {
            text: "Menunggu Konfirmasi",
            bgColor: "bg-[#9CA3AF]",
            textColor: "text-[#101828]",
        },
        confirmed: {
            text: "Dalam Antrean",
            bgColor: "bg-[#3B82F6]",
            textColor: "text-[#3B82F6]",
        },
        technician_on_the_way: {
            text: "Teknisi Meluncur",
            bgColor: "bg-[#0EA5E9]",
            textColor: "text-[#0EA5E9]",
        },
        on_working: {
            text: "Lagi Dikerjain",
            bgColor: "bg-[#F59E0B]",
            textColor: "text-[#F59E0B]",
        },
        waiting_payment: {
            text: "Tunggu Bayar",
            bgColor: "bg-[#FB923C]",
            textColor: "text-[#FB923C]",
        },
        completed: {
            text: "Selesai",
            bgColor: "bg-[#0cad31]",
            textColor: "text-[#0cad31]",
        },
        cancelled: {
            text: "Dibatalkan",
            bgColor: "bg-[#EF4444]",
            textColor: "text-[#EF4444]",
        },
    };
    return (
        statusMap[status] || {
            text: "Status Tidak Dikenal",
            bgColor: "bg-gray-700",
            textColor: "text-gray-700",
        }
    );
};
