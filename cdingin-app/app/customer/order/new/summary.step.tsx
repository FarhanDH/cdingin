import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
} from "@mui/material";
import axios from "axios";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import {
    AlertCircle,
    ArrowRightIcon,
    CalendarRange,
    ChevronRight,
    MapPin,
    Minus,
    Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import addNote from "~/assets/add-note.png";
import noteFilled from "~/assets/note-filled.png";
import { customToastStyle } from "~/common/custom-toast-style";
import Header from "~/components/header";
import { Calendar } from "~/components/ui/calendar";
import CustomDay from "~/components/ui/custom-day";
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "~/components/ui/drawer";
import Spinner from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";
import type {
    AcUnitDetail,
    OrderFormData,
    OrderStep,
} from "~/types/order.types";
import {
    DAILY_UNIT_LIMIT,
    type AvailabilityData,
} from "~/types/schedule.types";
import "../../../app.css";
import cashImage from "../../../assets/cash.png";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import technicianConfirmationIllustration from "~/assets/technician-confirmation.png";

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
    const [note, setNote] = useState(formData.note || "");
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isLimitAlertOpen, setIsLimitAlertOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [availability, setAvailability] = useState<AvailabilityData[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tempDate, setTempDate] = useState<Date | undefined>();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isSheetConfirmationOpen, setIsSheetConfirmationOpen] =
        useState<boolean>(false);

    const totalQuantityInCart =
        formData.acUnits?.reduce((acc, unit) => acc + unit.quantity, 0) || 0;

    const handleDateSelect = (date: Date | undefined) => {
        if (tempDate) {
            setSelectedDate(date);
            setIsCalendarOpen(false);
        }
    };

    const handleOpenCalendar = () => {
        fetchAvailability(); // Fetch the latest schedule ONLY when the calendar is opened
        setIsCalendarOpen(true);
    };

    const fetchAvailability = useCallback(async () => {
        setIsLoadingAvailability(true);
        try {
            // Ambil jadwal untuk bulan ini dan bulan depan
            const today = new Date();
            const startDate = format(startOfMonth(today), "yyyy-MM-dd");
            const endDate = format(
                endOfMonth(addMonths(today, 1)),
                "yyyy-MM-dd"
            );

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/schedules/availability`,
                {
                    params: {
                        "start-date": startDate,
                        "end-date": endDate,
                    },
                    withCredentials: true,
                }
            );
            setAvailability(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data jadwal:", error);
            toast("Gagal mengambil data tanggal", customToastStyle);
        } finally {
            setIsLoadingAvailability(false);
        }
    }, []); // function is created only once

    // useMemo to calculate disabled dates based on availability AND the current cart total
    const disabledDates = useMemo(() => {
        return (
            availability
                // A date is disabled if the booked units + units in cart > limit
                .filter(
                    (day) =>
                        day.totalUnitsBooked + totalQuantityInCart >
                        DAILY_UNIT_LIMIT
                )
                .map((day) => new Date(day.date))
        ); // Convert back to Date object
    }, [availability, totalQuantityInCart]);

    useEffect(() => {
        if (selectedDate) {
            const isStillAvailable = !disabledDates.some(
                (disabledDate) =>
                    disabledDate.getTime() === selectedDate.getTime()
            );
            if (!isStillAvailable) {
                setSelectedDate(undefined); // Invalidate the date
                toast(
                    "Jadwal gak tersedia. Silakan pilih tanggal lagi, ya",
                    customToastStyle
                );
            }
        }
    }, [totalQuantityInCart, disabledDates, selectedDate]);

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
        if (totalQuantityInCart >= 10) {
            setIsLimitAlertOpen(true);
        } else {
            onUpdateQuantity(unit.id, unit.quantity + 1);
        }
    };

    const handleConfirmDelete = () => {
        if (unitToDelete) {
            onUpdateQuantity(unitToDelete, 0);
            setUnitToDelete(null);
            setIsDeleteAlertOpen(false);
        }
    };

    return (
        <>
            <Header title="Konfirmasi pesananmu" isSticky showBorder={false} />
            <main>
                <div className="">
                    <div className="flex flex-col bg-gray-50 min-h-screen">
                        {/* Service Address */}
                        <div className="p-4 mb-2 shadow-md bg-white">
                            <div className="flex text-center gap-3">
                                <MapPin
                                    size={21}
                                    className="mb-2 text-gray-700"
                                />
                                <p className="text-sm font-medium text-gray-600">
                                    Alamat service
                                </p>
                            </div>
                            <p className="font-medium text-xl text-gray-900 flex items-center">
                                {formData.serviceLocation?.address ??
                                    "Lokasi belum diisi"}{" "}
                                {/* Navigate to location step */}
                                <button
                                    className="cursor-pointer items-center"
                                    onClick={() => navigateToStep("location")}
                                >
                                    <ChevronRight />
                                </button>
                            </p>

                            {/* Address Note for technician */}
                            {formData.serviceLocation?.note && (
                                <div className="flex items-start mt-2 gap-2 w-full bg-blue-50 rounded-xl p-2 border border-gray-200">
                                    <img
                                        src={noteFilled}
                                        alt="noteSuccess"
                                        className="w-4"
                                    />
                                    <p className="text-gray-800 text-sm">
                                        {formData.serviceLocation?.note}
                                    </p>
                                </div>
                            )}

                            {/* Property Type */}
                            <div className="flex items-center gap-2 text-sm mt-1">
                                <p className="font-medium text-gray-700">
                                    {formData.propertyType?.name ||
                                        "Tipe properti belum dipilih"}
                                </p>
                                <p className="text-gray-600">
                                    Lantai {formData.floor || "-"}
                                </p>
                                <button
                                    className="cursor-pointer text-gray-700"
                                    onClick={() =>
                                        navigateToStep("property-type")
                                    }
                                >
                                    <ChevronRight />
                                </button>
                            </div>

                            {/* Note for technician */}
                            <div className="mt-4 relative">
                                <label
                                    htmlFor="notes"
                                    className="block text-sm"
                                >
                                    <Textarea
                                        id="notes"
                                        placeholder="Catatan buat teknisi (opsional)"
                                        maxLength={100}
                                        value={note}
                                        onChange={(e) =>
                                            setNote(e.target.value)
                                        }
                                        className="pl-10 text-sm resize-none bg-gray-200 rounded-lg"
                                    />
                                    <img
                                        src={addNote}
                                        alt="add-note"
                                        className="w-4.5 absolute left-2 top-2.5"
                                    />
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
                                        <h1 className="font-medium text-md text-gray-800">
                                            Layanan / Keluhan
                                        </h1>
                                        <p className="text-xs text-gray-800">
                                            {formData.problems?.join(", ") ||
                                                "Tipe layanan belum dipilih"}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() =>
                                        navigateToStep("ac-problems")
                                    }
                                    className="text-primary border-primary rounded-full cursor-pointer font-semibold border-[1.5px] w-20 active:scale-95 normal-case text-base !font-[Rubik]"
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
                                                        <h1 className="font-semibold text-gray-800 text-md">
                                                            {`${unit.acType?.name} ${unit.pk}`}
                                                        </h1>
                                                        <p className="text-xs text-gray-500 font-medium">
                                                            {unit.brand ||
                                                                "Tidak ditentukan"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <IconButton
                                                        className="rounded-full border border-primary text-primary cursor-pointer active:scale-95"
                                                        onClick={() =>
                                                            handleDecreaseQuantity(
                                                                unit
                                                            )
                                                        }
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </IconButton>
                                                    <span className="font-semibold text-lg w-4 text-center">
                                                        {unit.quantity}
                                                    </span>
                                                    <IconButton
                                                        className="rounded-full border-primary text-primary cursor-pointer active:scale-95 border"
                                                        onClick={() =>
                                                            handleIncreaseQuantity(
                                                                unit
                                                            )
                                                        }
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </IconButton>
                                                </div>
                                            </div>
                                            {index <
                                                (formData.acUnits?.length ??
                                                    0) -
                                                    1 && (
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
                            0
                        ) < 10 && (
                            <div className="p-4 shadow-md mb-2 bg-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="font-semibold text-md">
                                            Ada tambahan?
                                        </h1>
                                        <p className="text-gray-600 text-sm">
                                            Masih bisa nambah unit AC, ya.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            navigateToStep("ac-type")
                                        }
                                        className="text-primary border-primary rounded-full cursor-pointer font-semibold border-[1.5px] w-20 active:scale-95 text-base normal-case !font-[Rubik]"
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
                            <img
                                src={cashImage}
                                alt="cash"
                                className="w-6 h-6"
                            />
                            <p className="text-sm text-gray-600">
                                Tagihan akan dibuat setelah teknisi selesai
                                servis.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {/* Calender input button */}
                            <button
                                type="button"
                                className="h-12 w-12 p-0 rounded-full border border-primary flex items-center justify-center active:scale-95 cursor-pointer"
                                onClick={handleOpenCalendar}
                            >
                                <CalendarRange className="text-primary w-6 h-6" />
                            </button>

                            {/* Confirm Button */}
                            <Button
                                onClick={() => setIsSheetConfirmationOpen(true)}
                                disabled={
                                    !selectedDate ||
                                    !formData.acUnits ||
                                    formData.acUnits.length === 0
                                }
                                className="flex-1 h-12 px-4 rounded-full flex bg-primary text-white justify-between items-center active:scale-95 cursor-pointer font-semibold border-[1.5px] border-primary text-base normal-case !font-[Rubik] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="text-left -space-y-0.5">
                                    <p className="font-semibold text-lg">
                                        {!selectedDate
                                            ? "Pilih tanggal servis"
                                            : "Jadwalin service"}
                                    </p>
                                    <p className="text-[11px] font-light mb-1 !font-[Rubik]">
                                        {selectedDate?.toLocaleDateString(
                                            "id-ID",
                                            {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
                                    <ArrowRightIcon
                                        className={`text-primary ${
                                            selectedDate &&
                                            (formData.acUnits ?? []).length >
                                                0 &&
                                            "animate-slide-right-loop"
                                        }`}
                                        size={16}
                                    />
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Confirmation Sheet */}
            <Sheet
                open={isSheetConfirmationOpen}
                onOpenChange={setIsSheetConfirmationOpen}
            >
                <SheetContent
                    side="bottom"
                    className="rounded-t-3xl max-w-lg mx-auto text-center"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <SheetHeader className="-mb-8">
                        <img
                            src={technicianConfirmationIllustration}
                            alt="Ilustrasi Peta"
                            className="w-full mx-auto"
                        />
                        <SheetTitle className="text-xl font-bold">
                            Pastiin pesananmu udah sesuai, ya
                        </SheetTitle>
                        <SheetDescription className="text-[16px] text-gray-600">
                            Abis dikonfirmasi, udah gak bisa diubah lagi.
                            Pesanan bakal langsung dikirim ke teknisi.
                        </SheetDescription>
                    </SheetHeader>

                    <SheetFooter className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={() => setIsSheetConfirmationOpen(false)}
                            disabled={isSubmitting}
                            className="w-full h-12 rounded-full font-semibold text-base bg-white border-[1.5px] border-[#006C7F] text-[#006C7F] active:scale-95 cursor-pointer normal-case !font-[Rubik]"
                        >
                            Cek kembali
                        </Button>
                        <Button
                            onClick={() => {
                                if (selectedDate) {
                                    onConfirm({
                                        note,
                                        serviceDate: selectedDate,
                                    });
                                    setIsSheetConfirmationOpen(false);
                                    setIsSubmitting(true);
                                }
                            }}
                            disabled={
                                !selectedDate ||
                                !formData.acUnits ||
                                formData.acUnits.length === 0
                            }
                            className="w-full h-12 rounded-full font-semibold text-md active:scale-95 cursor-pointer normal-case !font-[Rubik] bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        >
                            {isSubmitting ? (
                                <Spinner size={20} />
                            ) : (
                                "Lanjut aja"
                            )}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Calender Drawer */}
            <Drawer open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DrawerContent className="max-w-lg mx-auto rounded-t-3xl">
                    <DrawerHeader>
                        <DrawerTitle className="text-xl font-semibold">
                            Kapan mau service?
                        </DrawerTitle>
                        {isLoadingAvailability ? (
                            <div className="flex justify-center items-center h-80">
                                <Spinner size={50} />
                            </div>
                        ) : (
                            <Calendar
                                ISOWeek
                                required
                                locale={id}
                                mode="single"
                                selected={selectedDate}
                                // Use a temporary state for selection inside the calendar
                                onSelect={setTempDate}
                                disabled={(date) =>
                                    // Condition 1: Disable past dates
                                    date <
                                        new Date(
                                            new Date().setDate(
                                                new Date().getDate()
                                            )
                                        ) ||
                                    // Condition 2: Use the dynamically calculated disabledDates
                                    disabledDates.some(
                                        (disabledDate) =>
                                            disabledDate.getDate() ===
                                                date.getDate() &&
                                            disabledDate.getMonth() ===
                                                date.getMonth() &&
                                            disabledDate.getFullYear() ===
                                                date.getFullYear()
                                    )
                                }
                                // Additional: Visualize on the full dates
                                modifiers={{ full: disabledDates }}
                                components={{
                                    Day: (props) => <CustomDay {...props} />,
                                }}
                                autoFocus
                                className={`w-full min-h-80 border rounded-lg `}
                            />
                        )}
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button
                            onClick={() => {
                                handleDateSelect(tempDate);
                            }}
                            disabled={!tempDate}
                            className="w-full block h-[48px] rounded-full text-center text-md font-semibold cursor-pointer active:scale-95 normal-case !font-[Rubik] bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        >
                            Set jadwal
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Alerts */}
            <>
                {/* Limit Unit Alert */}
                <Dialog
                    open={isLimitAlertOpen}
                    onClose={() => setIsLimitAlertOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    className="max-w-md mx-auto"
                >
                    <div className="flex flex-col -space-y-3">
                        <DialogTitle
                            id="alert-dialog-title"
                            className="text-base font-semibold"
                        >
                            Wah, Banyak Banget AC-nya! 😱
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText
                                id="alert-dialog-description"
                                className="text-sm"
                            >
                                Maaf, untuk saat ini dibatesin 10 unit AC dulu,
                                ya.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setIsLimitAlertOpen(false)}
                                className="bg-primary text-white cursor-pointer active:scale-95 rounded-sm normal-case !font-[Rubik]"
                            >
                                Oke, siap
                            </Button>
                        </DialogActions>
                    </div>
                </Dialog>

                {/* Delete Unit Alert */}
                <Dialog
                    open={isDeleteAlertOpen}
                    onClose={setIsDeleteAlertOpen}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    className="max-w-md mx-auto !font-[Rubik]"
                >
                    <div className="flex flex-col -space-y-3">
                        <DialogTitle
                            id="alert-dialog-title"
                            className="text-base font-semibold !font-[Rubik]"
                        >
                            Hapus Unit AC?
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText
                                id="alert-dialog-description"
                                className="text-sm font !font-[Rubik]"
                            >
                                Apakah kamu yakin ingin hapus unit AC ini dari
                                daftar servicemu?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                className="w-20 text-primary border-primary cursor-pointer active:scale-95 border normal-case !font-[Rubik]"
                                onClick={() => {
                                    setUnitToDelete(null);
                                    setIsDeleteAlertOpen(false);
                                }}
                            >
                                Tidak
                            </Button>
                            <Button
                                className="bg-primary text-white cursor-pointer active:scale-95 rounded-sm normal-case !font-[Rubik]"
                                onClick={() => {
                                    handleConfirmDelete();
                                }}
                            >
                                Ya, Hapus
                            </Button>
                        </DialogActions>
                    </div>
                </Dialog>
            </>
        </>
    );
}
