import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, Modal, Image, ActivityIndicator, Alert, TextInput } from "react-native";
import { Button } from "../../ui/Button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../../ui/Sheet";
import { MapPin, ChevronRight, AlertCircle, Minus, Plus, Calendar as CalendarIcon, ArrowRight, FileText, FilePlus } from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { OrderFormData, AcUnitDetail, OrderStep } from "../../../types/order";

// Constants
const DAILY_UNIT_LIMIT = 20; // Example limit

interface SummaryStepProps {
    formData: Partial<OrderFormData>;
    onConfirm: (data: { serviceDate: Date; note: string }) => void;
    onUpdateQuantity: (unitId: string, newQuantity: number) => void;
    navigateToStep: (step: OrderStep) => void;
}

export default function SummaryStep({ formData, onConfirm, onUpdateQuantity, navigateToStep }: SummaryStepProps) {
    const [note, setNote] = useState(formData.note || "");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // Start undefined
    const [showDatePicker, setShowDatePicker] = useState(false);

    // UI State for Modals/Sheets
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
    const [isLimitAlertOpen, setIsLimitAlertOpen] = useState(false);
    const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
    const [isConfirmationSheetOpen, setIsConfirmationSheetOpen] = useState(false);
    const [tempNote, setTempNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalQuantityInCart = formData.acUnits?.reduce((acc, unit) => acc + unit.quantity, 0) || 0;

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            // Basic validation logic could go here (e.g. disable Sundays)
            if (date.getDay() === 0) {
                Alert.alert("Jadwal Tidak Tersedia", "Maaf, hari Minggu kami libur.");
                return;
            }
            setSelectedDate(date);
        }
    };

    const handleDecreaseQuantity = (unit: AcUnitDetail) => {
        if (unit.quantity > 1) {
            onUpdateQuantity(unit.id, unit.quantity - 1);
        } else {
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
            onUpdateQuantity(unitToDelete, 0); // 0 means remove usually, or implement remove logic upstream
            setUnitToDelete(null);
            setIsDeleteAlertOpen(false);
        }
    };

    const openNoteSheet = () => {
        setTempNote(note);
        setIsNoteSheetOpen(true);
    };

    const saveNote = () => {
        setNote(tempNote);
        setIsNoteSheetOpen(false);
    };

    const handleFinalConfirm = () => {
        if (selectedDate) {
            setIsSubmitting(true);
            onConfirm({ note, serviceDate: selectedDate });
            setTimeout(() => {
                setIsSubmitting(false); // Reset if it fails or navigation happens
                setIsConfirmationSheetOpen(false);
            }, 3000);
        }
    };

    return (
        <View className="flex-1 bg-white relative">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 150 }}>
                {/* Service Address */}
                <View className="p-4 mb-2 bg-white border-b border-gray-100 pb-6">
                    <View className="flex-row items-center gap-2 mb-1">
                        <MapPin size={16} color="#666" />
                        <Text className="text-sm font-medium text-gray-600">Alamat service</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="font-medium text-xl text-[#222222] flex-1">
                            {formData.serviceLocation?.address || "Lokasi belum diisi"}
                        </Text>
                        <Pressable onPress={() => navigateToStep("location")}>
                            <ChevronRight size={24} color="#222222" />
                        </Pressable>
                    </View>

                    {/* Location Note Display */}
                    {formData.serviceLocation?.note ? (
                        <View className="mt-2 bg-gray-100 border-l-4 border-gray-500 p-2">
                            <Text className="text-xs text-black font-light">{formData.serviceLocation.note}</Text>
                        </View>
                    ) : null}

                    {/* Property Type */}
                    <View className="flex-row items-center gap-2 mt-2">
                        <Text className="font-medium text-gray-700">
                            {formData.propertyType?.name || "Tipe properti belum dipilih"}
                        </Text>
                        <Text className="text-gray-600">
                            • Lantai {formData.floor || "-"}
                        </Text>
                        <Pressable onPress={() => navigateToStep("property-type")}>
                            <ChevronRight size={16} color="#666" />
                        </Pressable>
                    </View>

                    {/* Technician Note Button/Display */}
                    <View className="mt-3">
                        {note ? (
                            <Pressable onPress={openNoteSheet} className="bg-gray-100 border-l-4 border-gray-500 p-2 w-full">
                                <Text className="text-xs text-black font-light">{note}</Text>
                            </Pressable>
                        ) : (
                            <Pressable onPress={openNoteSheet} className="flex-row items-center bg-gray-100 border border-gray-300 rounded-full px-4 py-2 self-start gap-2">
                                <FilePlus size={14} color="#222" />
                                <Text className="text-xs font-medium text-[#222222]">Catatan</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* AC Problems */}
                <View className="p-4 border-b border-gray-100 bg-white">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row gap-3 items-center flex-1">
                            <View className="bg-orange-300 w-10 h-10 rounded-full items-center justify-center">
                                <AlertCircle size={20} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium text-base text-[#222222]">Layanan / Keluhan</Text>
                                <Text className="text-xs text-gray-600 ml-1 mt-1">
                                    {(formData.problems || []).join(", ")}
                                </Text>
                            </View>
                        </View>
                        <Button
                            variant="outline"
                            size="sm"
                            onPress={() => navigateToStep("ac-problems")}
                            className="rounded-full h-8 px-4 border-primary"
                        >
                            <Text className="text-primary text-xs font-semibold">Ganti</Text>
                        </Button>
                    </View>
                </View>

                {/* AC Units List */}
                {formData.acUnits && formData.acUnits.length > 0 && (
                    <View className="p-4 border-b border-gray-100 bg-white">
                        {formData.acUnits.map((unit, index) => (
                            <View key={unit.id} className="mb-4 pt-2">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-3">
                                        {/* Icon Placeholder or logic based on type */}
                                        <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center">
                                            <Text className="text-xs font-bold text-gray-500">AC</Text>
                                        </View>
                                        <View>
                                            <Text className="font-semibold text-[#222222] text-base">
                                                {unit.acType?.name} {unit.pk}
                                            </Text>
                                            <Text className="text-xs text-gray-500 font-medium">
                                                {unit.brand || "Merek tidak dipilih"}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-3">
                                        <Pressable
                                            onPress={() => handleDecreaseQuantity(unit)}
                                            className="rounded-full border border-primary p-1"
                                        >
                                            <Minus size={14} color="#057895" />
                                        </Pressable>
                                        <Text className="font-semibold text-lg text-[#222222] w-6 text-center">{unit.quantity}</Text>
                                        <Pressable
                                            onPress={() => handleIncreaseQuantity(unit)}
                                            className="rounded-full border border-primary p-1"
                                        >
                                            <Plus size={14} color="#057895" />
                                        </Pressable>
                                    </View>
                                </View>
                                {index < (formData.acUnits?.length || 0) - 1 && (
                                    <View className="border-t border-dashed border-gray-300 w-full my-3" />
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Add More Units Section */}
                {totalQuantityInCart < 10 && (
                    <View className="p-4 bg-white mb-20">
                        <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <View>
                                <Text className="font-semibold text-base text-[#222222]">Ada tambahan?</Text>
                                <Text className="text-gray-500 text-sm">Masih bisa nambah unit AC, ya.</Text>
                            </View>
                            <Button
                                variant="outline"
                                onPress={() => navigateToStep("ac-type")}
                                className="rounded-full h-9 px-4 border-primary bg-white"
                            >
                                <Text className="text-primary font-semibold text-sm">Tambah</Text>
                            </Button>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6">
                <View className="flex-row items-center gap-2 mb-3">
                    <View className="bg-primary/10 p-1 rounded-full">
                        <FileText size={16} color="#057895" />
                    </View>
                    <Text className="text-xs text-gray-500 flex-1">
                        Bayarnya nanti aja, kok. Tagihan bakal dibuat teknisi setelah servisnya kelar.
                    </Text>
                </View>

                <View className="flex-row gap-3">
                    <Pressable
                        onPress={() => setShowDatePicker(true)}
                        className="w-12 h-12 rounded-full border border-primary items-center justify-center bg-white"
                    >
                        <CalendarIcon size={24} color="#057895" />
                    </Pressable>

                    <Pressable
                        onPress={() => setIsConfirmationSheetOpen(true)}
                        disabled={!selectedDate || (formData.acUnits?.length === 0)}
                        className={`flex-1 h-12 rounded-full flex-row items-center justify-between active:scale-90 px-4 ${(!selectedDate || (formData.acUnits?.length === 0)) ? "bg-primary/50" : "bg-primary"
                            }`}
                    >
                        <View>
                            <Text className="font-semibold text-white text-base">
                                {selectedDate ? "Jadwalin service" : "Pilih tanggal servis"}
                            </Text>
                            {selectedDate && (
                                <Text className="text-[10px] text-white/90 font-light">
                                    {selectedDate.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </Text>
                            )}
                        </View>
                        <View className="w-6 h-6 bg-white rounded-full items-center justify-center">
                            <ArrowRight size={14} color="#057895" />
                        </View>
                    </Pressable>
                </View>
            </View>

            {/* Modals & Sheets */}

            {/* Note Sheet */}
            <Sheet open={isNoteSheetOpen} onOpenChange={setIsNoteSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Catatan buat teknisi</SheetTitle>
                    </SheetHeader>
                    <View className="px-5">
                        <View className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 h-40 mb-4">
                            <TextInput
                                multiline
                                textAlignVertical="top"
                                placeholder="Tulis catatan untuk teknisi di sini"
                                value={tempNote}
                                onChangeText={setTempNote}
                                className="flex-1 text-base text-[#222222]"
                            />
                        </View>
                        <Button onPress={saveNote} className="w-full h-12 rounded-full bg-primary mb-2">
                            <Text className="text-white font-semibold">Selesai</Text>
                        </Button>
                    </View>
                    <SheetFooter>
                        <View />
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Confirmation Sheet */}
            <Sheet open={isConfirmationSheetOpen} onOpenChange={setIsConfirmationSheetOpen}>
                <SheetContent className="px-4">
                    {/* <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}> */}
                    <Image
                        source={require('../../../../assets/technician-confirmation.png')} // Placeholder, ideally specific illustration
                        style={{
                            width: "100%",
                            height: 250,
                            resizeMode: "contain",
                            marginBottom: 20
                        }}
                    />
                    <Text className="text-xl font-bold text-center text-[#222222] mb-2">Pastiin pesanan udah sesuai, ya</Text>
                    <Text className="text-center text-gray-500 mb-6">
                        Setelah ini, pesananmu langsung meluncur ke teknisi dan nggak bisa diubah lagi. Pastiin semuanya udah oke, ya!
                    </Text>

                    <View className="flex-row gap-4 w-full">
                        <Pressable
                            onPress={() => setIsConfirmationSheetOpen(false)}
                            className="flex-1 h-[48px] rounded-full border border-primary items-center justify-center bg-white"
                        >
                            <Text className="text-primary font-semibold text-base">Cek lagi</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleFinalConfirm}
                            disabled={isSubmitting}
                            className="flex-1 h-[48px] rounded-full bg-primary items-center justify-center"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-semibold text-base">Lanjut aja</Text>
                            )}
                        </Pressable>
                    </View>
                    {/* </ScrollView> */}
                    {/* <SheetFooter>
                        <View />
                    </SheetFooter> */}
                </SheetContent>
            </Sheet>

            {/* Limit Alert */}
            <Modal visible={isLimitAlertOpen} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <Text className="text-lg font-bold mb-2">Wah, Banyak Banget AC-nya! 😱</Text>
                        <Text className="text-gray-600 mb-6">Maaf, untuk saat ini dibatesin 10 unit AC dulu, ya.</Text>
                        <Button onPress={() => setIsLimitAlertOpen(false)} className="bg-primary h-10 w-full rounded-sm">
                            <Text className="text-white font-medium">Oke, siap</Text>
                        </Button>
                    </View>
                </View>
            </Modal>

            {/* Delete Alert */}
            <Modal visible={isDeleteAlertOpen} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <Text className="text-lg font-bold mb-2">Hapus Unit AC?</Text>
                        <Text className="text-gray-600 mb-6">Anda yakin ingin hapus unit AC ini dari daftar servicemu?</Text>
                        <View className="flex-row justify-end gap-3">
                            <Button variant="outline" onPress={() => setIsDeleteAlertOpen(false)} className="border-primary px-4 h-9 rounded-md">
                                <Text className="text-primary">Tidak</Text>
                            </Button>
                            <Button onPress={handleConfirmDelete} className="bg-primary px-4 h-9 rounded-md">
                                <Text className="text-white">Ya, Hapus</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
}
