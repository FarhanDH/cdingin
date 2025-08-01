// summary.step.tsx

import {
  AlertCircle,
  ArrowRightIcon,
  CalendarRange,
  ChevronRight,
  MapPin,
  Minus,
  NotepadTextIcon,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import Header from '~/components/header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Textarea } from '~/components/ui/textarea';
import '../../../app.css';
import cashImage from '../../../assets/cash.png';
import type {
  AcUnitDetail,
  OrderFormData,
  OrderStep,
} from '~/types/order.types';

interface SummaryStepProps {
  formData: Partial<OrderFormData>;
  onConfirm: (data: { note: string; serviceDate: Date }) => void;
  onUpdateQuantity: (unitId: string, newQuantity: number) => void;
  navigateToStep: (step: OrderStep) => void;
}

export default function SummaryStep({
  formData,
  onUpdateQuantity,
  onConfirm,
  navigateToStep,
}: Readonly<SummaryStepProps>) {
  const [note, setNote] = useState(formData.note || '');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isLimitAlertOpen, setIsLimitAlertOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

  const totalQuantity =
    formData.acUnits?.reduce((acc, unit) => acc + unit.quantity, 0) || 0;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  // Fungsi untuk menangani klik tombol minus
  const handleDecreaseQuantity = (unit: AcUnitDetail) => {
    if (unit.quantity > 1) {
      // Jika kuantitas masih di atas 1, langsung update
      onUpdateQuantity(unit.id, unit.quantity - 1);
    } else {
      // Jika kuantitas adalah 1, buka dialog konfirmasi
      setUnitToDelete(unit.id);
      setIsDeleteAlertOpen(true);
    }
  };

  const handleIncreaseQuantity = (unit: AcUnitDetail) => {
    if (totalQuantity >= 10) {
      setIsLimitAlertOpen(true);
    } else {
      onUpdateQuantity(unit.id, unit.quantity + 1);
    }
  };

  const handleConfirmDelete = () => {
    if (unitToDelete) {
      onUpdateQuantity(unitToDelete, 0);
      setUnitToDelete(null);
    }
  };

  return (
    <>
      <Header title="Detail Pesananmu" isSticky showBorder={false} showBack />
      <div className="">
        <div className="flex flex-col bg-gray-50 min-h-screen">
          {/* Service Address */}
          <div className="p-4 mb-2 shadow-md bg-white">
            <div className="flex text-center gap-3">
              <MapPin size={21} className="mb-2 text-gray-700" />
              <p>Alamat service</p>
            </div>
            <p className="font-semibold text-xl text-gray-700 flex items-center">
              {formData.location || 'Lokasi belum diisi'}{' '}
              {/* Navigate to location step */}
              <button
                className="cursor-pointer items-center mt-1"
                onClick={() => navigateToStep('location')}
              >
                <ChevronRight />
              </button>
            </p>

            {/* Property Type */}
            <div className="flex items-center gap-2 text-sm">
              <p className="font-medium text-gray-700">
                {formData.propertyType?.name || 'Tipe properti belum dipilih'}
              </p>
              <p className="text-gray-600">Lantai {formData.floor || '-'}</p>
              <button
                className="cursor-pointer text-gray-700 "
                onClick={() => navigateToStep('property-type')}
              >
                <ChevronRight />
              </button>
            </div>

            {/* Note for technician */}
            <div className="mt-4 relative">
              <label htmlFor="notes" className="block text-sm">
                <Textarea
                  id="notes"
                  placeholder="      Catatan buat teknisi (opsional)"
                  maxLength={100}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-sm resize-none bg-gray-200 rounded-lg"
                />
                {note.length <= 0 && (
                  <NotepadTextIcon
                    className="absolute left-2 top-2.5 text-muted-foreground"
                    size={18}
                  />
                )}
                <p className="absolute right-2 bottom-1 text-muted-foreground text-xs">
                  {note.length} / 100
                </p>
              </label>
            </div>
          </div>

          {/* AC Problems */}
          <div className="p-4 shadow-md mb-2 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 ">
                <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center">
                  <AlertCircle className="w-10 text-yellow-500" />
                </div>
                <div>
                  <h1 className="font-semibold text-lg">Layanan / Keluhan</h1>
                  <p className="text-xs text-gray-800">
                    {formData.problems?.join(', ') ||
                      'Tipe layanan belum dipilih'}
                  </p>
                </div>
              </div>
              <Button
                variant={'outline'}
                onClick={() => navigateToStep('ac-problems')}
                className="text-primary border-primary rounded-full cursor-pointer font-semibold border-[1.5px] w-20 active:scale-95"
              >
                Ganti
              </Button>
            </div>
          </div>

          {/* Detail Unit AC */}
          {(formData.acUnits?.length ?? 0) > 0 && (
            <div className="p-4 shadow-md mb-2 bg-white">
              <div className="space-y-2 gap-3 items-center">
                {formData.acUnits?.map((unit, index) => (
                  <div key={unit.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={unit.acType?.icon}
                          alt={unit.acType?.name}
                          className="w-15"
                        />
                        <div>
                          <h1 className="font-semibold text-lg">
                            {`${unit.acType?.name} ${unit.pk}`}
                          </h1>
                          <p className="text-sm">
                            {unit.brand || 'Tidak ditentukan'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full border-primary text-primary cursor-pointer"
                          onClick={() => handleDecreaseQuantity(unit)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-semibold text-lg w-4 text-center">
                          {unit.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full border-primary text-primary cursor-pointer"
                          onClick={() => handleIncreaseQuantity(unit)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {index < formData.acUnits?.length - 1 && (
                      <div className="border-t-[1.5px] border-dashed border-gray-300 mx-auto w-full my-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional button to add another unit ac if current total quantity less than 10 */}
          {(formData.acUnits || []).reduce(
            (acc, unit) => acc + unit.quantity,
            0,
          ) < 10 && (
            <div className="p-4 shadow-md mb-2 bg-white">
              <div className="flex justify-between">
                <div>
                  <h1 className="font-semibold text-lg">Ada tambahan?</h1>
                  <p className="text-gray-600 text-sm">
                    Masih bisa nambah unit AC, ya.
                  </p>
                </div>
                <Button
                  variant={'outline'}
                  onClick={() => navigateToStep('ac-type')}
                  className="text-primary border-primary rounded-full cursor-pointer font-semibold border-[1.5px] w-20 active:scale-95"
                >
                  Tambah
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="w-full p-4 gap-4 flex flex-col sticky bottom-0 max-w-lg mx-auto bg-white border">
          <div className="flex items-center gap-2">
            <img src={cashImage} alt="cash" className="w-6 h-6" />
            <p className="text-sm text-gray-600">
              Tagihan akan dibuat setelah teknisi selesai servis.
            </p>
          </div>
          <div className="flex gap-2">
            {/* Calender input button */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-12 w-12 p-0 rounded-full border border-primary flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  <CalendarRange className="text-primary w-6 h-6" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  // Tambahan: Nonaktifkan tanggal yang sudah lewat
                  disabled={(date) =>
                    date < new Date(new Date().setDate(new Date().getDate()))
                  }
                  autoFocus
                  className="w-full"
                />
              </PopoverContent>
            </Popover>

            {/* Confirm Button */}
            <Button
              onClick={() => {
                if (selectedDate) {
                  onConfirm({ note, serviceDate: selectedDate });
                }
              }}
              disabled={
                !selectedDate ||
                !formData.acUnits ||
                formData.acUnits.length === 0
              }
              className="flex-1 h-12 px-4 rounded-full flex bg-primary text-white justify-between items-center active:scale-95 cursor-pointer"
            >
              <div className="text-left -space-y-0.5">
                <p className="font-semibold text-lg">
                  {!selectedDate ? 'Pilih tanggal servis' : 'Jadwalin service'}
                </p>
                <p className="text-[11px] font-light mb-1">
                  {selectedDate?.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
                <ArrowRightIcon
                  className={`text-primary ${
                    selectedDate &&
                    formData.acUnits.length > 0 &&
                    'animate-slide-right-loop'
                  }`}
                  size={16}
                />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <>
        {/* Limit Unit Alert */}
        <AlertDialog open={isLimitAlertOpen} onOpenChange={setIsLimitAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="text-start">
                <AlertDialogTitle>
                  Wah, Banyak Banget AC-nya! 😱
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Maaf, untuk saat ini dibatesin 10 unit AC dulu, ya.
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <div className="flex justify-end gap-5">
                <AlertDialogAction className="w-20  cursor-pointer active:scale-95">
                  Oke, Siap
                </AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Unit Alert */}
        <AlertDialog
          open={isDeleteAlertOpen}
          onOpenChange={setIsDeleteAlertOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader className="text-start">
              <AlertDialogTitle>Hapus Unit AC?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah kamu yakin ingin hapus unit AC ini dari daftar servicemu?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <div className="flex justify-end gap-5">
                <AlertDialogCancel
                  className="w-20 text-primary border-primary cursor-pointer active:scale-95"
                  onClick={() => setUnitToDelete(null)}
                >
                  Tidak
                </AlertDialogCancel>
                <AlertDialogAction
                  className="w-20  cursor-pointer active:scale-95"
                  onClick={handleConfirmDelete}
                >
                  Ya, Hapus
                </AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </>
  );
}
