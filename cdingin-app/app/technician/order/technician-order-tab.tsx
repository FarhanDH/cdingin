import { Badge, Button } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

export type TechnicianTabId = "today" | "tomorrow" | "upcoming";

export interface TabItem {
    id: TechnicianTabId;
    label: string;
}

interface TechnicianOrderTabsProps {
    tabs: TabItem[];
    activeTab: TechnicianTabId;
    onTabChange: (tabId: TechnicianTabId) => void;
}

export default function TechnicianOrderTab({
    tabs,
    activeTab,
    onTabChange,
}: Readonly<TechnicianOrderTabsProps>) {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            // setIsLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/orders/technician`,
                    {
                        params: {
                            "service-date": activeTab,
                        },
                        withCredentials: true,
                    }
                );

                setOrders(response.data.data);
            } catch (error) {
                console.error(
                    `Gagal mengambil pesanan untuk tab ${activeTab}:`,
                    error
                );
            }
        };
        fetchOrders();
    }, [activeTab]);

    return (
        <div className="flex justify-between items-center">
            {tabs.map((tab) => (
                <Button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`!hover:cursor-pointer w-full p-3 text-sm font-medium transition-colors !font-[Rubik] normal-case rounded-none ${
                        activeTab === tab.id
                            ? "border-b-3 border-primary text-black "
                            : "!hover:border-b-2 !hover:border-gray-200 text-gray-500"
                    }`}
                >
                    {activeTab === tab.id && orders ? (
                        <Badge
                            key={tab.id}
                            color="error"
                            variant="dot"
                            max={9}
                            invisible={orders.length === 0}
                            className="!font-[Rubik] mt-2 "
                        >
                            <p>{tab.label}</p>
                        </Badge>
                    ) : (
                        <p>{tab.label}</p>
                    )}
                </Button>
            ))}
        </div>
    );
}

// export default function TechnicianOrderTab({
//   tabs,
//   activeTab,
//   onTabChange,
// }: Readonly<TechnicianOrderTabsProps>) {
//   return (
//     <div className="flex justify-center space-x-2 sm:space-x-4 mb-2">
//       {tabs.map((tab) => (
//         <button
//           key={tab.id}
//           onClick={() => onTabChange(tab.id)}
//           className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
//             activeTab === tab.id
//               ? 'bg-primary text-white'
//               : 'text-gray-600 hover:bg-gray-100'
//           }`}
//         >
//           {tab.label}
//         </button>
//       ))}
//     </div>
//   );
// }
