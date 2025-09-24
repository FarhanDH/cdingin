import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import failedNote from "~/assets/failed-note.png";
import historyNote from "~/assets/history-note.png";
import successNote from "~/assets/note-success.png";
import EarningHistoryCard from "~/components/earning/earning-history-card";
import HorizontalDateScroller from "~/components/earning/horizontal-date-scroller";
import Header from "~/components/header";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { OrderItem } from "~/types/order.types";
import type { Route } from "./+types/earning";

interface EarningSummary {
    earningTotal: number;
    orderTotal: number;
    completedOrderCount: number;
    cancelledOrderCount: number;
}

const orderDummyData: OrderItem[] = [
    {
        id: "1",
        problems: ["Leaking water", "Faulty AC"],
        status: "completed",
        serviceLocation: {
            latitude: 37.7749,
            longitude: -122.4194,
            address: "123 Main St",
            note: "Near the park",
        },
        serviceDate: new Date("2022-01-01T10:00:00Z"),
        propertyType: "Apartment",
        propertyFloor: "3",
        note: "Please bring extra tools",
        customer: {
            id: "c1",
            fullName: "John Doe",
            phone: "1234567890",
        },
        acUnits: [
            {
                id: 1,
                acTypeName: "Window AC",
                acCapacity: "1.5 ton",
                brand: "LG",
                quantity: 2,
            },
            {
                id: 2,
                acTypeName: "Split AC",
                acCapacity: "2 ton",
                brand: "Samsung",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 3,
        createdAt: new Date("2022-01-01T09:00:00Z"),
        updatedAt: new Date("2022-01-01T09:15:00Z"),
    },
    {
        id: "2",
        problems: ["Faulty thermostat"],
        status: "completed",
        serviceLocation: {
            latitude: 37.7748,
            longitude: -122.4195,
            address: "456 Elm St",
            note: "Near the school",
        },
        serviceDate: new Date("2022-01-02T14:00:00Z"),
        propertyType: "House",
        propertyFloor: "2",
        note: "Please bring extra filters",
        customer: {
            id: "c2",
            fullName: "Jane Smith",
            phone: "0987654321",
        },
        acUnits: [
            {
                id: 3,
                acTypeName: "Ductless AC",
                acCapacity: "3 ton",
                brand: "Carrier",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 1,
        createdAt: new Date("2022-01-02T13:00:00Z"),
        updatedAt: new Date("2022-01-02T13:15:00Z"),
    },
    {
        id: "2",
        problems: ["Faulty thermostat"],
        status: "completed",
        serviceLocation: {
            latitude: 37.7748,
            longitude: -122.4195,
            address: "456 Elm St",
            note: "Near the school",
        },
        serviceDate: new Date("2022-01-02T14:00:00Z"),
        propertyType: "House",
        propertyFloor: "2",
        note: "Please bring extra filters",
        customer: {
            id: "c2",
            fullName: "Jane Smith",
            phone: "0987654321",
        },
        acUnits: [
            {
                id: 3,
                acTypeName: "Ductless AC",
                acCapacity: "3 ton",
                brand: "Carrier",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 1,
        createdAt: new Date("2022-01-02T13:00:00Z"),
        updatedAt: new Date("2022-01-02T13:15:00Z"),
    },
    {
        id: "2",
        problems: ["Faulty thermostat"],
        status: "completed",
        serviceLocation: {
            latitude: 37.7748,
            longitude: -122.4195,
            address: "456 Elm St",
            note: "Near the school",
        },
        serviceDate: new Date("2022-01-02T14:00:00Z"),
        propertyType: "House",
        propertyFloor: "2",
        note: "Please bring extra filters",
        customer: {
            id: "c2",
            fullName: "Jane Smith",
            phone: "0987654321",
        },
        acUnits: [
            {
                id: 3,
                acTypeName: "Ductless AC",
                acCapacity: "3 ton",
                brand: "Carrier",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 1,
        createdAt: new Date("2022-01-02T13:00:00Z"),
        updatedAt: new Date("2022-01-02T13:15:00Z"),
    },
    {
        id: "2",
        problems: ["Faulty thermostat"],
        status: "completed",
        serviceLocation: {
            latitude: 37.7748,
            longitude: -122.4195,
            address: "456 Elm St",
            note: "Near the school",
        },
        serviceDate: new Date("2022-01-02T14:00:00Z"),
        propertyType: "House",
        propertyFloor: "2",
        note: "Please bring extra filters",
        customer: {
            id: "c2",
            fullName: "Jane Smith",
            phone: "0987654321",
        },
        acUnits: [
            {
                id: 3,
                acTypeName: "Ductless AC",
                acCapacity: "3 ton",
                brand: "Carrier",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 1,
        createdAt: new Date("2022-01-02T13:00:00Z"),
        updatedAt: new Date("2022-01-02T13:15:00Z"),
    },
    {
        id: "2",
        problems: ["Faulty thermostat"],
        status: "completed",
        serviceLocation: {
            latitude: 37.7748,
            longitude: -122.4195,
            address: "456 Elm St",
            note: "Near the school",
        },
        serviceDate: new Date("2022-01-02T14:00:00Z"),
        propertyType: "House",
        propertyFloor: "2",
        note: "Please bring extra filters",
        customer: {
            id: "c2",
            fullName: "Jane Smith",
            phone: "0987654321",
        },
        acUnits: [
            {
                id: 3,
                acTypeName: "Ductless AC",
                acCapacity: "3 ton",
                brand: "Carrier",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 1,
        createdAt: new Date("2022-01-02T13:00:00Z"),
        updatedAt: new Date("2022-01-02T13:15:00Z"),
    },
    {
        id: "2",
        problems: ["Faulty thermostat"],
        status: "completed",
        serviceLocation: {
            latitude: 37.7748,
            longitude: -122.4195,
            address: "456 Elm St",
            note: "Near the school",
        },
        serviceDate: new Date("2022-01-02T14:00:00Z"),
        propertyType: "House",
        propertyFloor: "2",
        note: "Please bring extra filters",
        customer: {
            id: "c2",
            fullName: "Jane Smith",
            phone: "0987654321",
        },
        acUnits: [
            {
                id: 3,
                acTypeName: "Ductless AC",
                acCapacity: "3 ton",
                brand: "Carrier",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 1,
        createdAt: new Date("2022-01-02T13:00:00Z"),
        updatedAt: new Date("2022-01-02T13:15:00Z"),
    },
    {
        id: "2",
        problems: ["Faulty thermostat"],
        status: "cancelled",
        serviceLocation: {
            latitude: 37.7748,
            longitude: -122.4195,
            address: "456 Elm St",
            note: "Near the school",
        },
        serviceDate: new Date("2022-01-02T14:00:00Z"),
        propertyType: "House",
        propertyFloor: "2",
        note: "Please bring extra filters",
        customer: {
            id: "c2",
            fullName: "Jane Smith",
            phone: "0987654321",
        },
        acUnits: [
            {
                id: 3,
                acTypeName: "Ductless AC",
                acCapacity: "3 ton",
                brand: "Carrier",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 1,
        createdAt: new Date("2022-01-02T13:00:00Z"),
        updatedAt: new Date("2022-01-02T13:15:00Z"),
    },
    {
        id: "2",
        problems: ["Faulty thermostat"],
        status: "cancelled",
        serviceLocation: {
            latitude: 37.7748,
            longitude: -122.4195,
            address: "456 Elm St",
            note: "Near the school",
        },
        serviceDate: new Date("2022-01-02T14:00:00Z"),
        propertyType: "House",
        propertyFloor: "2",
        note: "Please bring extra filters",
        customer: {
            id: "c2",
            fullName: "Jane Smith",
            phone: "0987654321",
        },
        acUnits: [
            {
                id: 3,
                acTypeName: "Ductless AC",
                acCapacity: "3 ton",
                brand: "Carrier",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 1,
        createdAt: new Date("2022-01-02T13:00:00Z"),
        updatedAt: new Date("2022-01-02T13:15:00Z"),
    },
    {
        id: "2",
        problems: ["Faulty thermostat"],
        status: "cancelled",
        serviceLocation: {
            latitude: 37.7748,
            longitude: -122.4195,
            address: "456 Elm St",
            note: "Near the school",
        },
        serviceDate: new Date("2022-01-02T14:00:00Z"),
        propertyType: "House",
        propertyFloor: "2",
        note: "Please bring extra filters",
        customer: {
            id: "c2",
            fullName: "Jane Smith",
            phone: "0987654321",
        },
        acUnits: [
            {
                id: 3,
                acTypeName: "Ductless AC",
                acCapacity: "3 ton",
                brand: "Carrier",
                quantity: 1,
            },
        ],
        cancellationReason: undefined,
        cancellationNote: undefined,
        cancelledBy: undefined,
        invoiceId: undefined,
        totalUnits: 1,
        createdAt: new Date("2022-01-02T13:00:00Z"),
        updatedAt: new Date("2022-01-02T13:15:00Z"),
    },
];

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Pendapatan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function Earning() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [earningData, setEarningData] = useState<EarningSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchEarningSummary = async () => {
            setIsLoading(true);
            setEarningData({
                earningTotal: 350000,
                orderTotal: 10,
                completedOrderCount: 2,
                cancelledOrderCount: 4,
            });
            try {
                // const dateParam = formattedDate(selectedDate, { forApi: true });
                // const response = await axios.get(
                //   `${import.meta.env.VITE_API_URL}/technician/earnings/summary`,
                //   {
                //     params: { date: dateParam },
                //     withCredentials: true,
                //   }
                // );
                // setEarningData(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil ringkasan pendapatan:", error);
                toast.error("Gagal memuat data pendapatan.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEarningSummary();
    }, [selectedDate]); // <- Run each time selectedDate changes

    if (isLoading) {
        return (
            <div className="h-20 flex justify-center items-center">
                <CircularProgress size={20} className="text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <Header
                title="Pendapatan"
                isSticky={true}
                // showBorder={false}
                className="bg-white w-full"
            >
                {/* Date */}
                <div className="bg-gray-50 pt-2">
                    <h1 className="text-sm text-gray-900 font-medium text-center">{`${new Date(
                        selectedDate
                    ).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                    })}`}</h1>
                    {/* Date Scroller */}
                    <HorizontalDateScroller
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                    />
                </div>

                {/* Earning Summary Card */}
                <div className="rounded-2xl w-[91%] mx-auto my-4 bg-[#DBF8FF] py-2">
                    <div className="rounded-2xl">
                        <div className="px-4 flex items-end justify-between gap-2">
                            <div className="space-y-2 flex-grow w-full">
                                <h2 className="text-base font-medium text-gray-800">
                                    Ringkasan
                                </h2>
                                {/* Completed Order */}
                                <div className="flex items-center gap-2">
                                    <img
                                        src={successNote}
                                        alt="history"
                                        className="w-4 h-4"
                                    />
                                    <div className="flex justify-between items-center w-full">
                                        <p className="text-sm text-green-700">
                                            {`${earningData?.completedOrderCount} pesanan selesai`}
                                        </p>
                                    </div>
                                </div>

                                {/* Cancelled Order */}
                                <div className="flex items-center gap-2">
                                    <img
                                        src={failedNote}
                                        alt="history"
                                        className="w-4 h-4"
                                    />
                                    <div className="flex justify-between items-center w-full">
                                        <p className="text-sm text-red-700">
                                            {`${earningData?.cancelledOrderCount} pesanan dibatalkan`}
                                        </p>
                                    </div>
                                </div>

                                {/* Total Order */}
                                <div className="flex items-center gap-2">
                                    <img
                                        src={historyNote}
                                        alt="history"
                                        className="w-4 h-4"
                                    />
                                    <div className="flex justify-between items-center w-full">
                                        <p className="text-sm text-gray-700">
                                            {`${earningData?.orderTotal} total pesanan`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Earning */}
                        <div className="px-4 flex items-end justify-between mt-2">
                            <h2 className="text-[17px] font-medium text-gray-800">
                                Pendapatan
                            </h2>
                            <h2 className="text-[17px] font-medium text-gray-800">
                                {`Rp${earningData?.earningTotal.toLocaleString(
                                    "id-ID"
                                )}`}
                            </h2>
                        </div>
                    </div>
                </div>
            </Header>

            <div>
                {/* Earning History */}
                <div className=" bg-white">
                    {/* Earning History Card */}
                    <ScrollArea
                        className={`flex-grow overflow-y-auto w-full p-4`}
                        showScrollBar={false}
                    >
                        <div className="">
                            {orderDummyData?.map((earning) => (
                                <EarningHistoryCard
                                    key={earning.id}
                                    order={earning}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
