import { AirVent, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import standingACIcon from '~/assets/standing-ac.png';
import cassetteACIcon from '~/assets/cassette-ac.png';
import splitACIcon from '~/assets/split-ac.png';
import type { AcUnitDetail } from '~/types/order.types';

// Daftar pilihan untuk dropdown
const acTypes = [
  {
    id: 'split-ac',
    name: 'AC Split',
    icon: splitACIcon,
  },
  {
    id: 'standing-ac',
    name: 'AC Standing',
    icon: standingACIcon,
  },
  {
    id: 'cassette-ac',
    name: 'AC Cassette',
    icon: cassetteACIcon,
  },
];
const pkOptions = [
  '0.5 PK',
  '1 PK',
  '1.5 PK',
  '2 PK',
  '2.5 PK',
  '3 PK',
  '5 PK',
];
const brandOptions = [
  'Panasonic',
  'LG',
  'Daikin',
  'Samsung',
  'Sharp',
  'Polytron',
  'Gree',
  'TCL',
  'Mitsubishi',
  'Aqua',
];

interface AcUnitCardProps {
  unit: AcUnitDetail;
  index: number;
  onUpdate: (
    id: string,
    field: keyof AcUnitDetail,
    value: AcUnitDetail[keyof AcUnitDetail],
  ) => void;
  onRemove: (id: string) => void;
}

export default function AcUnitCard({
  unit,
  index,
  onUpdate,
  onRemove,
}: Readonly<AcUnitCardProps>) {
  return (
    <div className="bg-white border p-4 rounded-xl shadow-md mb-4 w-full space-y-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Unit AC #{index + 1}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => onRemove(unit.id)}
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </Button>
      </div>

      {/* Tipe AC */}
      <div>
        <label className="text-sm font-medium">
          <p>
            Tipe AC <span className="text-[#f34b1b]">*</span>
          </p>{' '}
        </label>
        <Select
          value={unit.acType?.id}
          onValueChange={(selectedId) => {
            const selectedAcType = acTypes.find((ac) => ac.id === selectedId);
            // Ensure it's not undefined before update
            if (selectedAcType) {
              onUpdate(unit.id, 'acType', selectedAcType);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Tipe AC" />
          </SelectTrigger>
          <SelectContent>
            {acTypes.map((acType) => (
              <SelectItem key={acType.id} value={acType.id}>
                <img
                  className="inline-block mr-2 w-6 h-6"
                  src={acType.icon}
                  alt={acType.name}
                />
                {acType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* PK & Merek dalam satu baris */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">
            <p>
              Kapasitas (PK) <span className="text-[#f34b1b]">*</span>
            </p>{' '}
          </label>
          <Select
            value={unit.pk}
            onValueChange={(value) => onUpdate(unit.id, 'pk', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih PK" />
            </SelectTrigger>
            <SelectContent>
              {pkOptions.map((pk) => (
                <SelectItem key={pk} value={pk}>
                  {pk}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">
            <p>
              Merek <span className="text-[#f34b1b]">*</span>
            </p>{' '}
          </label>
          <Select
            value={unit.brand}
            onValueChange={(value) => onUpdate(unit.id, 'brand', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Merek" />
            </SelectTrigger>
            <SelectContent>
              {brandOptions.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jumlah Unit */}
      <div className="flex justify-between items-center pt-2">
        <label className="font-medium">Jumlah Unit</label>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary text-primary cursor-pointer"
            onClick={() => onUpdate(unit.id, 'quantity', unit.quantity - 1)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="font-semibold text-lg">{unit.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary text-primary cursor-pointer"
            onClick={() => onUpdate(unit.id, 'quantity', unit.quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
