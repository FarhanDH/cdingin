import { AirVent, ChevronRight } from 'lucide-react';

export default function CustomerOrderCard() {
  return (
    <div className="border-b-[1.3px] bg-white overflow-hidden pl-4 py-3 cursor-pointer transition duration-50 ease-in transform hover:bg-gray-50 active:bg-gray-100">
      {/* Top section */}
      <button className="w-full text-start cursor-pointer">
        <div className="flex justify-between border-b-[1.3px] mb-3 ">
          {/* Left section */}
          <div className="mb-4 borer border-amber-">
            <h1 className="font-medium text-md">#S38297</h1>
            <h2 className="text-gray-600">25 Januari 2020</h2>
          </div>
          {/* Right section: align to end */}
          <div className="mb-4 flex flex-col items-end space-y-2 mr-4">
            <ChevronRight size={18} color="#333" className="ml-21 mt-1" />
            {/* <p className="text-gray-700 text-xs mr-4 mb-3">Sedang Dikerjakan</p> */}
            <span className="px-3 rounded-sm text-xs text-white text-center bg-[#FF8A00] flex items-center h-7">
              Lagi Dikerjain
            </span>
          </div>
        </div>
        {/* Bottom section */}
        <div className="flex items-center text-sm text-gray-500 mr-4">
          <span className="w-56 md:w-80">
            {['Air Netes / Bocor', 'AC Tidak Menyala'].join(', ')}
          </span>
          <div className="flex items-center ml-auto">
            <AirVent className="mr-2" size={20} />
            <span>2 Unit</span>
          </div>
        </div>
      </button>
    </div>
  );
}
