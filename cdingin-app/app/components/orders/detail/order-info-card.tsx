import { formattedDate } from "~/common/utils";
import type { OrderItem } from "~/types/order.types";

interface OrderInfoCardProps {
    order: OrderItem;
}

export default function OrderInfoCard({ order }: Readonly<OrderInfoCardProps>) {
    return (
        <div className="bg-white p-4 mb-6 rounded-xl shadow-xs border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div className="font-medium">Order ID</div>
                <div className="font-medium">{order.id}</div>
            </div>
            <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-700">Tanggal service</div>
                <div className="text-xs text-gray-700">
                    {formattedDate(order.serviceDate, {
                        withTime: false,
                    })}
                </div>
            </div>
            <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-700">Waktu pemesanan</div>
                <div className="text-xs text-gray-700">
                    {formattedDate(order.createdAt, {
                        withTime: true,
                    })}
                </div>
            </div>

            {order.updatedAt !== order.createdAt && (
                <div className="flex justify-between items-center mb-1">
                    <div className="text-xs text-gray-700">
                        Waktu diperbarui
                    </div>
                    <div className="text-xs text-gray-700">
                        {formattedDate(order.updatedAt, {
                            withTime: true,
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
