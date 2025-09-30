import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import { Button } from "@mui/material";
import { AirVent, ChevronRight } from "lucide-react";
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
        navigate(`/technician/order/${order.id}`);
    };

    return (
        <Button
            onClick={handleCardClick}
            className="bg-white overflow-hidden p-4 cursor-pointer transition duration-50 ease-in transform hover:bg-gray-50 active:bg-gray-100 w-full border-b-2 border-gray-200 shadow-xs mb-2 normal-case !font-[Rubik] font-normal rounded-none"
        >
            <div className="flex flex-col justify-between items-start gap-2 w-full">
                <div className="flex w-full gap-4 justify-between items-start">
                    {/* Icon */}
                    <div className="bg-primary w-9 h-9 rounded-full flex items-center justify-center text-center">
                        <AirVent className="text-white w-18" />
                    </div>
                    {/* Top section */}
                    <div className="w-full text-start cursor-pointer">
                        <div className="flex justify-between border-b-[1.3px] border-gray-200 mb-2 pb-2">
                            {/* Left section */}
                            <div className="space-y-2">
                                {/* Total amount */}
                                <h1 className="font-medium text-[17px] text-gray-800">{`Rp${Number(
                                    order.amount
                                )?.toLocaleString("id-ID")}`}</h1>
                                {/* Customer Name */}
                                <h2 className="text-gray-600 text-sm">
                                    {order.customer.fullName}
                                </h2>
                            </div>
                            {/* Right section: align to end */}
                            <div className="flex flex-col items-end space-y-2">
                                {/* Payment methods */}
                                <div className="flex items-center">
                                    {order.paymentMethod === "cash" ? (
                                        <>
                                            <PaymentsRoundedIcon
                                                className="mr-2 text-green-600"
                                                fontSize="small"
                                            />
                                            <span className="text-gray-800 font-medium text-base">{`Tunai`}</span>
                                        </>
                                    ) : order.paymentMethod === "midtrans" ? (
                                        <>
                                            <WalletRoundedIcon
                                                className="mr-2 text-green-600"
                                                fontSize="small"
                                            />
                                            <span className="text-gray-800 font-medium text-base">{`Transfer`}</span>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                                <span
                                    className={`${statusColor} items-center h-7 font-medium text-base`}
                                >
                                    {statusText}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Bottom section */}
                <div className="text-sm text-gray-500 w-full">
                    <div className="flex items-center justify-between w-full">
                        <div className="space-y-4 text-start w-full">
                            <span className="w-full  line-clamp-1 ml-13">
                                {order.problems.join(", ")}
                            </span>
                            <div className="flex items-center justify-start w-full">
                                <div className="bg-red-400 w-3 h-3 rounded-full ml-3"></div>
                                <span className="line-clamp-1 ml-7 w-[85%]">
                                    {order.serviceLocation.address.display_name}
                                </span>
                            </div>
                        </div>

                        <ChevronRight size={30} className="text-gray-700" />
                    </div>
                </div>
            </div>
        </Button>
    );
}
