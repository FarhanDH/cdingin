import { OrderStatusEnum } from '~/common/enums/order-status.enum';
import { Order } from '../entities/order.entity';

export class OrderResponse {
  id: string;
  problems: string[];
  status: OrderStatusEnum;
  serviceLocation: string;
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
  totalUnits: number;
  createdAt: Date;
  updatedAt: Date;
}

export const toOrderResponse = (order: Order): OrderResponse => ({
  id: order.id,
  problems: order.ac_problems,
  status: order.status,
  serviceLocation: order.service_location,
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

  createdAt: order.created_at,
  updatedAt: order.updated_at,
});
