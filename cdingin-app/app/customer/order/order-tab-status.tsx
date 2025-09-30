import { Button } from "@mui/material";
import type { OrderTabsProps } from "~/types/order.types";

export default function CustomerOrderTab({
    tabs,
    activeTab,
    onTabChange,
}: Readonly<OrderTabsProps>) {
    return (
        <div className="flex space-x-0.5 sm:space-x-10 mb-2">
            {tabs.map((tab) => (
                <Button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`!font-[Rubik] rounded-none normal-case hover:cursor-pointer p-3 text-[13px] font-medium transition-colors ${
                        activeTab === tab.id
                            ? "border-b-2 border-secondary text-black"
                            : // 'bg-secondary text-white'
                              "!hover:border-b-2 !hover:border-gray-200 text-gray-500"
                    }`}
                    // className={`hover:cursor-pointer px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    //   activeTab === tab.id
                    //     ? 'bg-secondary text-white w-200'
                    //     : ' text-gray-500 hover:bg-gray-200'
                    // }`}
                >
                    {tab.label}
                </Button>
            ))}
        </div>
    );
}
