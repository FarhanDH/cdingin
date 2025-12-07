export type OrderStatus =
    | "pending"
    | "confirmed"
    | "technician_on_the_way"
    | "on_working"
    | "waiting_payment"
    | "completed"
    | "cancelled";

export type OrderItem = {
    id: string;
    problems: string[];
    status: OrderStatus;
    serviceLocation: {
        latitude: number;
        longitude: number;
        address?: any;
        note?: string;
    };
    serviceDate: Date; // Keep as Date or string depending on API response, usually string in JSON
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
    amount?: number;
    paymentMethod?: string;
    createdAt: Date;
    updatedAt: Date;
};

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
    serviceDate: Date | string;
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
    serviceDate: string;
    note?: string;
};

export type OrderStep = "ac-problems" | "location" | "property-type" | "ac-type" | "summary";
