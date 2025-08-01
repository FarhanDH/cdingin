import { useState } from 'react';
import Header from '~/components/header';
import { Button } from '~/components/ui/button';

export default function LocationStep({
  initialLocation,
  onSubmit,
  onBack,
}: Readonly<{
  initialLocation: string;
  onSubmit: (data: { location: string }) => void;
  onBack: () => void;
}>) {
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSubmit({ location });
    }
  };

  return (
    <>
      <Header title="Lokasi Service" isSticky />
      <div className="bg-white p-4 ">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-xl font-bold mb-2">Pilih Lokasi</h1>
          <div>
            <label htmlFor="location" className="font-normal">
              Lokasi <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Cth: Jl. Berdua No. 123"
              className="w-full border-b border-gray-400 pb-2 focus:outline-none text-lg font-medium tracking-wide mt-2"
            />
          </div>
        </form>
      </div>

      {/* Tombol Navigasi yang Terpusat */}
      <div className="w-full p-4 gap-2 flex fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border pr-5">
        <Button
          type="button"
          variant={'outline'}
          onClick={onBack}
          className="w-1/2 h-[48px] rounded-full text-md font-semibold text-primary border-primary cursor-pointer"
        >
          Kembali
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!location.trim()}
          className="w-1/2 h-[48px] rounded-full text-md font-semibold cursor-pointer"
        >
          Lanjut
        </Button>
      </div>
    </>
  );
}
