import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import type { OrderItem } from "~/types/order.types";

interface ServiceAddressCardProps {
    order: OrderItem;
    serviceAddressDetail: any; // Can be string or object from Nominatim
}

export default function ServiceAddressCard({
    order,
    serviceAddressDetail,
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
                        <p className="font-semibold text-start text-lg text-gray-800 ">
                            {serviceAddressDetail?.address?.amenity ||
                                serviceAddressDetail?.address?.road ||
                                order.serviceLocation.address ||
                                "Lokasi belum diisi"}{" "}
                        </p>
                        <p className="mt-1 text-sm text-gray-700 ">
                            {typeof serviceAddressDetail === "string"
                                ? serviceAddressDetail
                                : serviceAddressDetail?.display_name ||
                                  "Lokasi belum diisi"}
                        </p>

                        {order.serviceLocation.note && (
                            <div className="flex items-start mt-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
                                <HomeFilledIcon className="text-green-600" />
                                <p className="text-gray-800 text-xs w-full">
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
