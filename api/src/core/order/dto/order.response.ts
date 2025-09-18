import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { Order, Subject } from '../entities/order.entity';

export class OrderResponse {
    id: string;
    problems: string[];
    status: OrderStatusEnum;
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
    customer?: {
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
    cancelledBy?: Subject;
    totalUnits: number;
    invoiceId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const toOrderResponse = (order: Order): OrderResponse => ({
    id: order.id,
    problems: order.ac_problems,
    status: order.status,
    serviceLocation: {
        latitude: order.latitude_service_location,
        longitude: order.longitude_service_location,
        address: order.service_location_address,
        note: order.service_location_note,
    },
    serviceDate: order.service_date,
    propertyType: order.property_type,
    propertyFloor: order.property_floor,
    note: order.note,
    customer: {
        id: order.customer.id,
        fullName: order.customer.full_name,
        phone: order.customer.phone_number,
    },
    acUnits: order.ac_units.map((acUnit) => ({
        id: acUnit.id,
        acTypeName: acUnit.ac_type_name,
        acCapacity: acUnit.ac_capacity,
        brand: acUnit.brand,
        quantity: acUnit.quantity,
    })),
    totalUnits: order.ac_units.reduce(
        (total, acUnit) => total + acUnit.quantity,
        0,
    ),
    invoiceId: order.invoice?.id || null,
    cancellationReason: order.cancellation_reason,
    cancellationNote: order.cancellation_note,
    cancelledBy: order.cancelled_by,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
});
