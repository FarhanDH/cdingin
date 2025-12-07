import React, { useState } from "react";
import { View, Text, ScrollView, Modal, TouchableOpacity } from "react-native";
import { Button } from "../../ui/Button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../../ui/Sheet";
import { Plus } from "lucide-react-native";
import AcUnitCard from "./AcUnitCard";
import { AcUnitDetail } from "../../../types/order";

interface AcTypeStepProps {
    initialAcUnits: AcUnitDetail[];
    onSubmit: (data: { acUnits: AcUnitDetail[] }) => void;
    onBack: () => void;
}

export default function AcTypeStep({ initialAcUnits, onSubmit, onBack }: AcTypeStepProps) {
    const [acUnits, setAcUnits] = useState<AcUnitDetail[]>(
        initialAcUnits.length > 0 ? initialAcUnits : []
    );
    const [alertVisible, setAlertVisible] = useState(false);

    // Select Modal State
    const [selectModalVisible, setSelectModalVisible] = useState(false);
    const [selectTitle, setSelectTitle] = useState("");
    const [selectOptions, setSelectOptions] = useState<any[]>([]);
    const [onSelectCallback, setOnSelectCallback] = useState<(val: any) => void>(() => { });

    const openSelectModal = (title: string, options: any[], onSelect: (val: any) => void) => {
        setSelectTitle(title);
        setSelectOptions(options);
        setOnSelectCallback(() => onSelect);
        setSelectModalVisible(true);
    };

    const handleAddUnit = () => {
        const totalQty = acUnits.reduce((acc, u) => acc + u.quantity, 0);
        if (totalQty >= 10) {
            setAlertVisible(true);
            return;
        }
        setAcUnits([
            ...acUnits,
            {
                id: Math.random().toString(36),
                acType: null,
                pk: "",
                brand: "",
                quantity: 1,
            },
        ]);
    };

    const handleRemoveUnit = (id: string) => {
        setAcUnits(acUnits.filter((u) => u.id !== id));
    };

    const handleUpdateUnit = (id: string, field: keyof AcUnitDetail, value: any) => {
        setAcUnits(acUnits.map(u => u.id === id ? { ...u, [field]: value } : u));
    };

    const isNextDisabled = acUnits.length === 0 || acUnits.some(u => !u.acType || !u.pk || !u.brand);

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {acUnits.length === 0 && (
                    <View className="text-center py-10 px-4 bg-white border border-gray-200 shadow-sm rounded-lg items-center mb-4">
                        <Text className="text-gray-600 text-base">Silakan tambahkan unit AC.</Text>
                        <Text className="text-sm text-gray-500 mt-1">Klik tombol di bawah untuk tambah unit AC.</Text>
                    </View>
                )}

                {acUnits.map((unit, index) => (
                    <AcUnitCard
                        key={unit.id}
                        unit={unit}
                        index={index}
                        onUpdate={handleUpdateUnit}
                        onRemove={handleRemoveUnit}
                        openSelectModal={openSelectModal}
                    />
                ))}

                <Button
                    variant="outline"
                    onPress={handleAddUnit}
                    className="w-full mt-2 border border-secondary"
                >
                    <Text className="text-secondary font-medium">
                        {acUnits.length === 0 ? "[+] Tambah Tipe AC" : "[+] Tambah Tipe AC Lain"}
                    </Text>
                </Button>
            </ScrollView>

            <View className="w-full p-4 gap-2 flex-row absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                <Button variant="outline" onPress={onBack} className="flex-1 h-12 rounded-full border-primary">
                    <Text className="text-primary font-semibold text-base">Kembali</Text>
                </Button>
                <Button
                    onPress={() => onSubmit({ acUnits })}
                    disabled={isNextDisabled}
                    className="flex-1 h-12 rounded-full bg-primary"
                >
                    <Text className="text-white font-semibold text-base">Lanjut</Text>
                </Button>
            </View>

            {/* Limit Alert Modal */}
            <Modal
                transparent={true}
                visible={alertVisible}
                animationType="fade"
                onRequestClose={() => setAlertVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 p-4">
                    <View className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <Text className="text-lg font-bold mb-2">Wah, Banyak Banget AC-nya! 😱</Text>
                        <Text className="text-gray-600 mb-6">Maaf, untuk saat ini dibatesin 10 unit AC dulu, ya.</Text>
                        <Button onPress={() => setAlertVisible(false)} className="w-full bg-primary rounded-sm h-10">
                            <Text className="text-white font-medium">Oke, siap</Text>
                        </Button>
                    </View>
                </View>
            </Modal>

            {/* Selection Sheet */}
            <Sheet open={selectModalVisible} onOpenChange={setSelectModalVisible}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{selectTitle}</SheetTitle>
                    </SheetHeader>
                    <ScrollView className="p-2 max-h-96">
                        {selectOptions.map((opt, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => {
                                    onSelectCallback(opt);
                                    setSelectModalVisible(false);
                                }}
                                className="p-4 border-b border-gray-100 flex-row items-center gap-3"
                            >
                                <Text className="text-base text-[#222222]">{opt.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <SheetFooter>
                        <Button variant="outline" onPress={() => setSelectModalVisible(false)} className="w-full rounded-full border-gray-300">
                            <Text className="text-gray-500 font-medium">Batal</Text>
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </View>
    );
}
