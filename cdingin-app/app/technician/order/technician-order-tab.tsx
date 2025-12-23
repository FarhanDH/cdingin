import { Badge, Button } from "@mui/material";
import type { OrderCounts } from "~/types/order.types";

export type TechnicianTabId = "today" | "tomorrow" | "upcoming";

export interface TabItem {
    id: TechnicianTabId;
    label: string;
}

interface TechnicianOrderTabsProps {
    tabs: TabItem[];
    activeTab: TechnicianTabId;
    onTabChange: (tabId: TechnicianTabId) => void;
    orderCounts: OrderCounts | null;
}

export default function TechnicianOrderTab({
    tabs,
    activeTab,
    onTabChange,
    orderCounts,
}: Readonly<TechnicianOrderTabsProps>) {
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
                    <Badge
                        color="error"
                        badgeContent={orderCounts ? orderCounts[tab.id] : 0}
                        invisible={!orderCounts || orderCounts[tab.id] === 0}
                        className="!font-[Rubik] pr-2"
                    >
                        <p>{tab.label}</p>
                    </Badge>
                </Button>
            ))}
        </div>
    );
}
