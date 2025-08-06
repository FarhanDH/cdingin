import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@radix-ui/react-dialog';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import threeTechniciansImage from '~/assets/three-technicians.png';
import Header from '~/components/header';
import Spinner from '~/components/ui/spinner';
import type { OrderItem, TechnicianabItem } from '~/types/order.types';
import TechnicianOrderCard from './order-card';
import type { TechnicianTabId } from './technician-order-tab';
import TechnicianOrderTab from './technician-order-tab';

export default function TechnicianOrderList() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TechnicianTabId>('today');

  // Fetch orders data for each activeTab changing
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/technician`,
          {
            params: {
              'service-date': activeTab,
            },
            withCredentials: true,
          },
        );

        setOrders(response.data.data);
      } catch (error) {
        console.error(`Gagal mengambil pesanan untuk tab ${activeTab}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  const tabs: TechnicianabItem[] = [
    { id: 'today', label: 'Hari Ini' },
    { id: 'tomorrow', label: 'Besok' },
    { id: 'upcoming', label: 'Mendatang' },
  ];

  return (
    <div>
      {isLoading && (
        <div
          className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50 ${
            isLoading ? 'bg-black/50' : ''
          }`}
        >
          <Dialog open={isLoading} modal>
            <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
              <Spinner size={30} />
            </DialogContent>
          </Dialog>
        </div>
      )}
      <div>
        {/* Header */}
        <Header isSticky={true} title="Daftar Pesanan">
          <TechnicianOrderTab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </Header>

        {/* Order List */}
        {orders.length === 0 ? (
          <div className="mt-10 items-center w-full mb-auto flex flex-col text-center p-4">
            <img
              src={threeTechniciansImage}
              alt={threeTechniciansImage}
              className="w-80 max-w-lg mb-6"
            />
            <h1 className="font-semibold text-lg">Lagi sepi. Santai dulu</h1>
          </div>
        ) : (
          orders.map((order) => (
            <TechnicianOrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}
