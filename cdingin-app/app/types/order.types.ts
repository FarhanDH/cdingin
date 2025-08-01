export type OrderStep =
  | 'ac-problems'
  | 'location'
  | 'ac-type'
  | 'property-type'
  | 'summary';

// Tipe untuk detail satu jenis AC
export type AcUnitDetail = {
  id: string; // Sebaiknya gunakan UUID yang unik
  acType: {
    id: string;
    name: string;
    icon: string; // Simpan path icon sebagai string
  } | null;
  pk: string;
  brand: string;
  quantity: number;
};

// Tipe untuk keseluruhan data form pesanan
export type OrderFormData = {
  problems: string[];
  location: string;
  acUnits: AcUnitDetail[];
  propertyType: {
    id: string;
    name: string;
  } | null;
  floor: number;
  note?: string;
  serviceDate: Date;
};
