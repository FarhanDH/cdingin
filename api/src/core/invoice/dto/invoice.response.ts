import { InvoiceStatus } from '~/common/enums/invoice.enum';
import { Invoice } from '../entities/invoice.entity';
import {
    OrderResponse,
    toOrderResponse,
} from '~/core/order/dto/order.response';

export class InvoiceItemResponseDto {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export class InvoiceResponseDto {
    id: string;
    order: OrderResponse;
    invoiceNumber: string;
    status: InvoiceStatus;
    totalAmount: number;
    issuedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    items: InvoiceItemResponseDto[];
}

export const toInvoiceResponseDto = (invoice: Invoice): InvoiceResponseDto => {
    return {
        id: invoice.id,
        order: toOrderResponse(invoice.order),
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        totalAmount: invoice.total_amount,
        issuedAt: invoice.issued_at,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at,
        items: invoice.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price,
        })),
    };
};
