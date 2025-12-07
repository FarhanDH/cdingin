import { client } from "./client";
import { CreateOrderRequestDto, OrderItem } from "../types/order";

export const getOrders = async (status: string) => {
    return client.get<{ data: OrderItem[] }>("/orders", {
        params: { status },
    });
};

export const createOrder = async (data: CreateOrderRequestDto) => {
    return client.post<{ data: OrderItem }>("/orders", data);
};
