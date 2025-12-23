import { Button } from "@mui/material";

export type EarningTabId = "completed" | "cancelled" | "missed";

export interface TabItem {
    id: EarningTabId;
    label: string;
}

interface EarningTabsProps {
    tabs: TabItem[];
    activeTab: EarningTabId;
    onTabChange: (tabId: EarningTabId) => void;
}

export default function EarningTab({
    tabs,
    activeTab,
    onTabChange,
}: Readonly<EarningTabsProps>) {
    return (
        <div className="max-w-lg mx-auto items-center flex justify-center w-full">
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
                    {tab.label}
                </Button>
            ))}
        </div>
    );
}
