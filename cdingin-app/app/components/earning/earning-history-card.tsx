import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import { Button } from "@mui/material";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { getStatusLabel, type OrderItem } from "~/types/order.types";

interface EarningHistoryCardProps {
    order: OrderItem;
}

export default function EarningHistoryCard({
    order,
}: Readonly<EarningHistoryCardProps>) {
    const { text: statusText, textColor: statusColor } = getStatusLabel(
        order.status
    );
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/order/${order.id}`);
    };

    return (
        <Button
            onClick={handleCardClick}
            className="bg-white overflow-hidden pl-4 pr-0 py-3 cursor-pointer transition duration-50 ease-in transform hover:bg-gray-50 active:bg-gray-100 w-full rounded-2xl border-2 border-gray-200 mb-4 normal-case !font-[Rubik] font-normal"
        >
            {/* Top section */}
            <div className="w-full text-start cursor-pointer">
                <div className="flex justify-between border-b-[1.3px] border-gray-200 mb-2 pb-2">
                    {/* Left section */}
                    <div className="space-y-2">
                        {/* Total amount */}
                        <h1 className="font-medium text-[17px] text-gray-800">{`Rp100.000`}</h1>{" "}
                        {/* Customer Name */}
                        <h2 className="text-gray-600 text-sm">
                            {order.customer.fullName}
                        </h2>{" "}
                        {/* <p className="text-gray-600 text-sm">
                            {order.propertyType}
                        </p>{" "} */}
                    </div>
                    {/* Right section: align to end */}
                    <div className="flex flex-col items-end space-y-2 mr-4">
                        {/* Payment method */}
                        <div className="flex items-center">
                            <PaymentsRoundedIcon
                                className="mr-1 text-green-600"
                                fontSize="inherit"
                            />
                            <span className="text-gray-800">{`Tunai`}</span>
                        </div>
                        <span
                            className={`${statusColor} items-center h-7 font-medium`}
                        >
                            {statusText}
                        </span>
                    </div>
                </div>
                {/* Bottom section */}
                <div className="flex items-center text-sm text-gray-500 mr-4 justify-between">
                    <span className="w-56 md:w-80 line-clamp-1">
                        {order.problems.join(", ")}
                    </span>
                    <ChevronRight size={25} className="mt-1 text-gray-600" />

                    {/* <div className="flex items-center ml-auto">
                        <AirVent className="mr-2" size={20} />
                        <span>{order.totalUnits} Unit</span>
                    </div> */}
                </div>
            </div>
        </Button>
    );
}
