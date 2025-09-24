export type OrderStep =
    | "ac-problems"
    | "location"
    | "ac-type"
    | "property-type"
    | "summary";

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "technician_on_the_way"
    | "on_working"
    | "waiting_payment"
    | "completed"
    | "cancelled";

export interface CustomerTabItem {
    id: "progress" | "completed" | "cancelled"; // For Customer
    label: string;
    active?: boolean;
}

export interface TechnicianabItem {
    id: "today" | "tomorrow" | "upcoming"; // For Technician
    label: string;
    active?: boolean;
}

export interface OrderTabsProps {
    tabs: CustomerTabItem[];
    activeTab: string;
    onTabChange: (tabId: "progress" | "completed" | "cancelled") => void;
}

export type CustomerOrderTabType = "progress" | "completed" | "cancelled";

export type AcUnitDetail = {
    id: string;
    acType: {
        id: string;
        name: string;
        icon: string;
    } | null;
    pk: string;
    brand: string;
    quantity: number;
};

export type OrderFormData = {
    problems: string[];
    serviceLocation: {
        latitude: number;
        longitude: number;
        address?: any;
        note?: string;
    };
    acUnits: AcUnitDetail[];
    propertyType: {
        id: string;
        name: string;
    } | null;
    floor: number;
    note?: string;
    serviceDate: Date;
};

export type AcUnitDto = {
    acTypeId: string;
    acCapacity: string;
    brand: string;
    quantity: number;
};

export type CreateOrderRequestDto = {
    acProblems: string[];
    serviceLocation: {
        latitude: number;
        longitude: number;
        address?: string;
        note?: string;
    };
    propertyType: string;
    floor: number;
    acUnits: AcUnitDto[];
    serviceDate: Date;
    note?: string;
};

export type OrderItem = {
    id: string;
    problems: string[];
    status: OrderStatus;
    serviceLocation: {
        latitude: number;
        longitude: number;
        address?: string;
        note?: string;
    };
    serviceDate: Date;
    propertyType: string;
    propertyFloor: string;
    note?: string;
    customer: {
        id: string;
        fullName: string;
        phone: string;
    };
    acUnits: {
        id: number;
        acTypeName: string;
        acCapacity: string;
        brand: string;
        quantity: number;
    }[];
    cancellationReason?: string;
    cancellationNote?: string;
    cancelledBy?: {
        id: string;
        role: string;
        fullName: string;
    };
    invoiceId?: string;
    totalUnits: number;
    createdAt: Date;
    updatedAt: Date;
};

export const getStatusLabel = (status: OrderStatus) => {
    const statusMap: Record<
        OrderStatus,
        { text: string; bgColor: string; textColor: string }
    > = {
        pending: {
            text: "Menunggu Konfirmasi",
            bgColor: "bg-[#9CA3AF]",
            textColor: "text-[#9CA3AF]",
        },
        confirmed: {
            text: "Dalam Antrean",
            bgColor: "bg-[#3B82F6]",
            textColor: "text-[#3B82F6]",
        },
        technician_on_the_way: {
            text: "Teknisi OTW",
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
            bgColor: "bg-[#10B937]",
            textColor: "text-[#10B937]",
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
