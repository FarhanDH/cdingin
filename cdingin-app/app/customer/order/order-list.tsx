import { useEffect, useState } from 'react';
import CustomerOrderCard from '~/components/customer-order-card';
import Header from '~/components/header';
import { Button } from '~/components/ui/button';
import OrderTabStatus, { type TabItem } from './order-tab-status';

const orderData: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export default function CustomerOrderList() {
  const [activeTab, setActiveTab] = useState<
    'proses' | 'selesai' | 'dibatalkan'
  >('proses');
  useEffect(() => {}, []);

  const tabs: TabItem[] = [
    { id: 'proses', label: 'Proses' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'dibatalkan', label: 'Dibatalkan' },
  ];

  return (
    <div>
      <Header isSticky={true} title="Daftar Pesanan">
        <OrderTabStatus
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Header>
      <div className="">
        {orderData.length === 0 ? (
          <h1 className="text-center justify-center flex items-center text-gray-500">
            Belum ada pesanan
          </h1>
        ) : (
          orderData.map((item) => <CustomerOrderCard key={item} />)
        )}
      </div>

      {/* FLoating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50 h-0">
        <div className="flex justify-end items-end pb-10 pl-12 h-0">
          <Button className="w-15 h-15 text-white text-4xl rounded-xl cursor-pointer active:bg-[#004A5A] mr-4.5 mb-15">
            +
          </Button>
        </div>
      </div>
    </div>
  );
}
