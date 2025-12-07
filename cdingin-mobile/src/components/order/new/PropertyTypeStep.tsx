import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Button } from "../../ui/Button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../../ui/Sheet";
import { ChevronRight } from "lucide-react-native";

const PROPERTY_TYPES = [
    { id: "home", name: "Rumah" },
    { id: "boarding-house", name: "Kost" },
    { id: "hotel", name: "Hotel" },
    { id: "office", name: "Kantor" },
    { id: "shop", name: "Toko" },
];

const FLOOR_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

interface PropertyTypeStepProps {
    initialPropertyType: { id: string; name: string } | null | undefined;
    initialFloor: number | undefined;
    onSubmit: (data: { propertyType: any; floor: number }) => void;
    onBack: () => void;
}

export default function PropertyTypeStep({
    initialPropertyType,
    initialFloor,
    onSubmit,
    onBack,
}: PropertyTypeStepProps) {
    const [selectedProperty, setSelectedProperty] = useState(
        PROPERTY_TYPES.find((p) => p.id === initialPropertyType?.id) || null
    );
    const [floor, setFloor] = useState<string>(initialFloor ? initialFloor.toString() : "");
    const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);

    const handleSubmit = () => {
        if (selectedProperty && floor) {
            onSubmit({ propertyType: selectedProperty, floor: Number(floor) });
        }
    };

    return (
        <View className="flex-1 bg-white relative">
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-xl font-semibold mb-4 text-[#222222] pt-4">
                    Tipe bangunannya gimana?
                </Text>
                <View className="gap-2">
                    {PROPERTY_TYPES.map((property) => (
                        <TouchableOpacity
                            key={property.id}
                            onPress={() => setSelectedProperty(property)}
                            className={`flex-row items-center justify-between border-[1.5px] p-4 rounded-lg my-1 ${selectedProperty?.id === property.id
                                ? "border-primary bg-secondary/10 bg-[#057895]/5"
                                : "border-gray-300"
                                }`}
                        >
                            <Text className="font-medium text-xl flex-1 text-[#222222]">
                                {property.name}
                            </Text>
                            <View className={`w-6 h-6 rounded-full border border-gray-300 items-center justify-center ${selectedProperty?.id === property.id ? "border-primary" : ""
                                }`}>
                                {selectedProperty?.id === property.id && (
                                    <View className="w-3 h-3 rounded-full bg-primary" />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text className="text-xl font-semibold my-4 mt-8 text-[#222222]">
                    Di lantai Berapa AC-nya?
                </Text>

                <TouchableOpacity
                    onPress={() => setIsFloorModalOpen(true)}
                    className="w-full flex-row items-center justify-between p-4 border border-gray-300 rounded-lg"
                >
                    <Text className={`text-base font-medium ${floor ? "text-[#222222]" : "text-gray-400"}`}>
                        {floor ? `Lantai ${floor}` : "Pilih Lantai"}
                    </Text>
                    <ChevronRight size={20} color="#666" />
                </TouchableOpacity>

            </ScrollView>

            <View className="w-full p-4 gap-2 flex-row absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200">
                <Button
                    variant="outline"
                    onPress={onBack}
                    className="flex-1 h-12 rounded-full border-primary"
                >
                    <Text className="text-primary font-semibold text-base">Kembali</Text>
                </Button>
                <Button
                    onPress={handleSubmit}
                    disabled={!selectedProperty || !floor}
                    className="flex-1 h-12 rounded-full bg-primary"
                >
                    <Text className="text-white font-semibold text-base">Lanjut</Text>
                </Button>
            </View>

            {/* Simple Floor Selection Sheet */}
            <Sheet open={isFloorModalOpen} onOpenChange={setIsFloorModalOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Pilih Lantai</SheetTitle>
                    </SheetHeader>
                    <ScrollView className="px-4 h-60">
                        {FLOOR_OPTIONS.map((f) => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => {
                                    setFloor(f.toString());
                                    setIsFloorModalOpen(false);
                                }}
                                className="py-3 border-b border-gray-100 flex-row justify-center"
                            >
                                <Text className="text-center text-lg text-[#222222]">Lantai {f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <SheetFooter>
                        <Button variant="outline" onPress={() => setIsFloorModalOpen(false)} className="w-full rounded-full border-gray-300">
                            <Text className="text-gray-500 font-medium">Batal</Text>
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </View>
    );
}
