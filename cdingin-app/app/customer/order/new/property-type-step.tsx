import { Label } from '@radix-ui/react-label';
import { HomeIcon, LampFloorIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import Header from '~/components/header';
import { Button } from '~/components/ui/button';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

type PropertyType = {
  id: string;
  name: string;
  icon: JSX.Element;
};

interface PropertyTypeStepProps {
  initialPropertyType: { id: string; name: string } | null | undefined;
  initialFloor: number | undefined;
  onSubmit: (data: { propertyType: PropertyType; floor: number }) => void;
  onBack: () => void;
}

const propertyTypes = [
  {
    id: 'home',
    name: 'Rumah',
    icon: <HomeIcon className="w-10 h-10 text-[#006C7F]" />,
  },
  {
    id: 'boarding-house',
    name: 'Kost',
    icon: <HomeIcon className="w-10 h-10 text-[#006C7F]" />,
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: <HomeIcon className="w-10 h-10 text-[#006C7F]" />,
  },
  {
    id: 'office',
    name: 'Kantor',
    icon: <HomeIcon className="w-10 h-10 text-[#006C7F]" />,
  },
  {
    id: 'shop',
    name: 'Toko',
    icon: <HomeIcon className="w-10 h-10 text-[#006C7F]" />,
  },
];

export default function PropertyTypeStep({
  onSubmit,
  onBack,
  initialPropertyType,
  initialFloor,
}: Readonly<PropertyTypeStepProps>) {
  // State sekarang menyimpan seluruh objek property, bukan hanya ID
  const [selectedProperty, setSelectedProperty] = useState(
    () => propertyTypes.find((p) => p.name === initialPropertyType) || null,
  );
  const [floor, setFloor] = useState(initialFloor || 1);

  const handleSubmit = () => {
    if (selectedProperty && floor) {
      onSubmit({ propertyType: selectedProperty, floor: Number(floor) });
    }
  };

  return (
    <>
      <Header title="Tipe Properti" isSticky />
      <div className="p-4 pb-28">
        <h1 className="text-xl font-semibold mb-4">Bangunannya gimana?</h1>
        <RadioGroup
          value={selectedProperty?.id}
          onValueChange={(id) => {
            const property = propertyTypes.find((p) => p.id === id);
            setSelectedProperty(property || null);
          }}
          className="grid grid-cols-1 gap-2"
        >
          {propertyTypes.map((property) => (
            <Label
              key={property.id}
              htmlFor={property.id}
              className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer ${
                selectedProperty?.id === property.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              {property.icon}
              <p className="font-medium text-xl flex-1">{property.name}</p>
              <RadioGroupItem value={property.id} id={property.id} />
            </Label>
          ))}
        </RadioGroup>

        <h1 className="text-xl font-semibold my-4">Lantai Berapa AC-nya?</h1>
        <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg">
          <LampFloorIcon size={40} className="text-[#006C7F]" />
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(parseInt(e.target.value, 10))}
            inputMode="numeric"
            id="floor"
            name="floor"
            min={1}
            placeholder="Cth: 2"
            className="w-full text-lg font-medium focus:outline-none focus:border-[#222222] border-b"
          />
        </div>
      </div>

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
          onClick={handleSubmit}
          disabled={!selectedProperty || !floor}
          className="w-1/2 h-[48px] rounded-full text-md font-semibold cursor-pointer"
        >
          Lanjut
        </Button>
      </div>
    </>
  );
}
