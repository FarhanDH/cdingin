import { MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Button } from "../../ui/Button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../../ui/Sheet";

interface LocationNoteSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    initialNote: string;
    onSave: (note: string) => void;
    locationDetails: any; // Simplified for RN
    address: string;
}

export default function LocationNoteSheet({
    isOpen,
    onOpenChange,
    initialNote,
    onSave,
    locationDetails,
    address,
}: LocationNoteSheetProps) {
    const [tempNote, setTempNote] = useState(initialNote);

    useEffect(() => {
        if (isOpen) {
            setTempNote(initialNote);
        }
    }, [isOpen, initialNote]);

    const handleSave = () => {
        onSave(tempNote);
        onOpenChange(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Catatan buat teknisi</SheetTitle>
                </SheetHeader>

                <View className="px-5">
                    {/* Location Details Display */}
                    <View className="bg-secondary/15 p-3 rounded-lg flex-row items-start gap-3 mb-4 bg-[#057895]/10">
                        <View className="bg-red-400 p-1 rounded-full items-center justify-center w-8 h-8">
                            <MapPin size={16} color="white" fill="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-medium text-md text-[#222222]">
                                {locationDetails?.name || "Lokasi Terpilih"}
                            </Text>
                            <Text className="text-sm text-gray-600" numberOfLines={2}>
                                {address}
                            </Text>
                        </View>
                    </View>

                    {/* Input Field */}
                    <TextInput
                        value={tempNote}
                        onChangeText={setTempNote}
                        placeholder="Cth: Rumah pagar hijau, no. 10 paling ujung"
                        className="border border-gray-300 rounded-lg p-3 text-base mb-4 text-[#222222]"
                        maxLength={255}
                    />

                    {/* Save Button */}
                    <Button
                        onPress={handleSave}
                        className="w-full h-[48px] active:scale-90 rounded-full bg-primary"
                    >
                        <Text className="text-white font-semibold text-base">Lanjut</Text>
                    </Button>
                </View>
                <SheetFooter>
                    <View />
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
