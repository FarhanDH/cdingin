import LocationPinIcon from "@mui/icons-material/LocationPin";
import type { OrderItem } from "~/types/order.types";

interface ServiceAddressCardProps {
    order: OrderItem;
    serviceAddress: object;
}

export default function ServiceAddressCard({
    order,
    serviceAddress,
}: Readonly<ServiceAddressCardProps>) {
    return (
        <div className="p-4 bg-white rounded-xl shadow-xs border border-gray-200">
            <div className="flex items-start text-center justify-between">
                <div className="flex items-start text-center gap-4">
                    <div className="bg-red-400 w-9 h-9 rounded-full flex items-center justify-center text-center">
                        <LocationPinIcon className="w-20 text-white" />
                    </div>
                    <p className="text-gray-700 text-sm">Alamat service</p>
                </div>
            </div>

            <div className="flex ml-13 flex-col -mt-3 text-start gap-1">
                <div>
                    <div>
                        <h1 className="font-semibold text-start text-lg text-gray-800 ">
                            {order?.serviceLocation.address.address?.amenity ||
                                order?.serviceLocation.address.address?.road ||
                                order?.serviceLocation.address.address
                                    ?.village ||
                                "Mohon tunggu"}{" "}
                        </h1>
                        <p className="mt-1 text-sm text-gray-700 ">
                            {order.serviceLocation.address?.display_name ||
                                "Mohon tunggu"}
                        </p>

                        {order.serviceLocation.note && (
                            <div className="flex items-start mt-2 gap-2 w-full bg-gray-100 p-2 border-l-4 border-gray-500 rounded">
                                <p className="text-gray-700 text-sm w-full">
                                    {order.serviceLocation.note}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center mt-1 gap-4 text-sm">
                            <p className="font-medium text-gray-800">
                                {order.propertyType ||
                                    "Tipe properti belum dipilih"}
                            </p>
                            <p className="text-gray-600">
                                Lantai {order.propertyFloor || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
