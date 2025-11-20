import { Badge, Button } from "@mui/material";
import type { CustomerOrderTabsProps } from "~/types/order.types";

export default function CustomerOrderTab({
    tabs,
    activeTab,
    onTabChange,
    orderCounts,
}: Readonly<CustomerOrderTabsProps>) {
    return (
        <div className="flex space-x-0.5 sm:space-x-10 mb-2">
            {tabs.map((tab) => (
                <Button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`!font-[Rubik] rounded-none normal-case hover:cursor-pointer p-3 text-[13px] font-medium transition-colors ${
                        activeTab === tab.id
                            ? "border-b-2 border-secondary text-black"
                            : "!hover:border-b-2 !hover:border-gray-200 text-gray-500"
                    }`}
                >
                    {tab.id === "progress" ? (
                        <Badge
                            color="error"
                            variant="dot"
                            badgeContent={orderCounts ? orderCounts[tab.id] : 0}
                            invisible={
                                !orderCounts || orderCounts[tab.id] === 0
                            }
                        >
                            {tab.label}
                        </Badge>
                    ) : (
                        <p>{tab.label}</p>
                    )}
                </Button>
            ))}
        </div>
    );
}
