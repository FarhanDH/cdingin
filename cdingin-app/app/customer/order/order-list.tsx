import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import CustomerOrderCard from '~/components/customer-order-card';
import Header from '~/components/header';
import OrderTabStatus, { type TabItem } from './order-tab-status';
import { useNavigate } from 'react-router';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import Spinner from '~/components/ui/spinner';

const orderData: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export default function CustomerOrderList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'proses' | 'selesai' | 'dibatalkan'
  >('proses');
  useEffect(() => {}, []);

  const handleActionButton = async () => {
    // Handle action button click

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call loading
    navigate('/order/new');
  };

  const tabs: TabItem[] = [
    { id: 'proses', label: 'Proses' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'dibatalkan', label: 'Dibatalkan' },
  ];

  return (
    <div>
      {loading && (
        <div
          className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50 ${
            loading ? 'bg-black/50' : ''
          }`}
        >
          <Dialog open={loading} modal>
            <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
              <Spinner size={30} />
            </DialogContent>
          </Dialog>
        </div>
      )}
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
            <button
              className="w-15 h-15 bg-primary text-white flex justify-center items-center rounded-xl cursor-pointer active:bg-[#004A5A] hover:bg-primary/90 mr-4.5 mb-15 shadow-md shadow-neutral-500"
              onClick={handleActionButton}
            >
              <PlusIcon size={26} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
