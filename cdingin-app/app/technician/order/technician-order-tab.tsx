export type TechnicianTabId = 'today' | 'tomorrow' | 'upcoming';

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
    <div className="flex justify-center space-x-4 sm:space-x-16 mb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`hover:cursor-pointer px-6 py-2 text-sm text-gray-500 font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 border-secondary text-secondary'
              : // 'bg-secondary text-white'
                'hover:border-b-2 hover:border-gray-200'
          }`}
          // className={`hover:cursor-pointer px-6 py-2 rounded-md text-sm font-medium transition-colors ${
          //   activeTab === tab.id
          //     ? 'bg-secondary text-white w-200'
          //     : ' text-gray-500 hover:bg-gray-200'
          // }`}
        >
          {tab.label}
        </button>
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
