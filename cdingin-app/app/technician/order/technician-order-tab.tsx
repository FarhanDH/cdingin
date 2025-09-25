import { Button } from "@mui/material";

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
                    {tab.label}
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
