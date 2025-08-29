import { AirVent, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { formattedDate } from "~/common/utils";
import { getStatusLabel, type OrderItem } from "~/types/order.types";

interface CustomerOrderCardProps {
    order: OrderItem;
}

export default function TechnicianOrderCard({
    order,
}: Readonly<CustomerOrderCardProps>) {
    const { text: statusText, color: statusColor } = getStatusLabel(
        order.status
    );
    const navigate = useNavigate();
    const formatDate = formattedDate(order.serviceDate);

    const handleCardClick = () => {
        navigate(`/technician/order/${order.id}`);
    };

    return (
        <button
            onClick={handleCardClick}
            className="border-b-[1.3px] bg-white overflow-hidden pl-4 py-3 cursor-pointer transition duration-50 ease-in transform hover:bg-gray-50 active:bg-gray-100 w-full"
        >
            {/* Top section */}
            <div className="w-full text-start cursor-pointer">
                <div className="flex justify-between border-b-[1.3px] mb-2 pb-2">
                    {/* Left section */}
                    <div className="">
                        <h1 className="font-medium text-lg">
                            {order.customer.fullName}
                        </h1>{" "}
                        {/* Customer Name*/}
                        <h2 className="text-gray-600">{formatDate}</h2>{" "}
                        {/* Service Date*/}
                        <p className="text-gray-600 text-sm">
                            {order.propertyType}
                        </p>{" "}
                        {/* order property type*/}
                    </div>
                    {/* Right section: align to end */}
                    <div className="flex flex-col items-end space-y-2 mr-4">
                        <ChevronRight size={18} color="#888" className="mt-1" />
                        <span
                            className={`px-3 mt-2 rounded-sm text-xs text-white text-center ${statusColor} flex items-center h-7`}
                        >
                            {statusText}
                        </span>
                    </div>
                </div>
                {/* Bottom section */}
                <div className="flex items-center text-sm text-gray-500 mr-4">
                    <span className="w-56 md:w-80 line-clamp-1">
                        {order.problems.join(", ")}
                    </span>
                    <div className="flex items-center ml-auto">
                        <AirVent className="mr-2" size={20} />
                        <span>{order.totalUnits} Unit</span>
                    </div>
                </div>
            </div>
        </button>
    );
}
