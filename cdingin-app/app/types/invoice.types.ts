import type { OrderItem } from "./order.types";

export enum InvoiceStatus {
    DRAFT = "draft",
    UNPAID = "unpaid",
    PAID = "paid",
    VOID = "void",
}

export type InvoiceItemForm = {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
};
export type InvoiceItemResponse = {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
};

export type InvoiceResponse = {
    id: string;
    order: OrderItem;
    invoiceNumber: string;
    status: InvoiceStatus;
    totalAmount: number;
    issuedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    items: InvoiceItemResponse[];
    payments: {
        id: string;
        status: string;
        method: string;
        paymentGateway: string;
        expiryTime: string;
        paymentChannel: string;
    }[];
};
