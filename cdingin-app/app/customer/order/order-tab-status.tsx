export interface TabItem {
  id: 'proses' | 'selesai' | 'dibatalkan'; // For Customer
  // id: 'Hari ini' | 'Besok' | 'Mendatang'; // For Technician
  label: string;
  active?: boolean;
}

interface OrderTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: 'proses' | 'selesai' | 'dibatalkan') => void;
}

export default function OrderTabStatus({
  tabs,
  activeTab,
  onTabChange,
}: Readonly<OrderTabsProps>) {
  return (
    <div className="flex justify-center space-x-4 sm:space-x-16 mb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`hover:cursor-pointer px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-secondary text-white w-200'
              : ' text-gray-500 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
