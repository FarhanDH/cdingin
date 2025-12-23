import React from "react";
import { View, Text, TouchableOpacity, Modal, Image } from "react-native";
import { Trash2, Minus, Plus, ChevronDown } from "lucide-react-native";
// import { Picker } from '@react-native-picker/picker'; // Could use Picker or custom Modal for Select

// Mock Select for now using simple modal logic inside parent or here?
// To keep it simple and match "Select" UI, I'll use a custom simplified Select using ActionSheet/Modal concept if needed, 
// or just standard RN Views styled to look like select triggers. 

interface AcUnitDetail {
    id: string;
    acType: any;
    pk: string;
    brand: string;
    quantity: number;
}

const AC_TYPES = [
    { id: "split-ac", name: "AC Split", icon: "air-conditioner" }, // Simplified icon ref
    { id: "standing-ac", name: "AC Standing", icon: "server" },
    { id: "cassette-ac", name: "AC Cassette", icon: "grid" },
];

const PK_OPTIONS = ["0.5 PK", "1 PK", "1.5 PK", "2 PK", "2.5 PK", "3 PK", "5 PK"];
const BRAND_OPTIONS = ["Panasonic", "LG", "Daikin", "Samsung", "Sharp", "Polytron", "Gree", "TCL", "Mitsubishi", "Aqua"];

interface AcUnitCardProps {
    unit: AcUnitDetail;
    index: number;
    onUpdate: (id: string, field: keyof AcUnitDetail, value: any) => void;
    onRemove: (id: string) => void;
    // Helper to open selection modal provided by parent usually, but creating self-contained logic here
    openSelectModal: (title: string, options: any[], onSelect: (val: any) => void) => void;
}

export default function AcUnitCard({ unit, index, onUpdate, onRemove, openSelectModal }: AcUnitCardProps) {
    return (
        <View className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-4 w-full space-y-4">
            <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-lg text-[#222222]">Unit AC #{index + 1}</Text>
                <TouchableOpacity
                    className="p-2 bg-red-50 rounded-full"
                    onPress={() => onRemove(unit.id)}
                >
                    <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {/* Type AC */}
            <View>
                <View className="flex-row">
                    <Text className="text-sm font-medium text-gray-700">Tipe AC </Text>
                    <Text className="text-red-500">*</Text>
                </View>
                <TouchableOpacity
                    onPress={() => openSelectModal("Pilih Tipe AC", AC_TYPES, (val) => onUpdate(unit.id, "acType", val))}
                    className="mt-2 border border-gray-300 rounded-lg p-3 flex-row justify-between items-center bg-white"
                >
                    <Text className="text-base text-[#222222]">{unit.acType?.name || "Pilih Tipe AC"}</Text>
                    <ChevronDown size={20} color="#666" />
                </TouchableOpacity>
            </View>

            {/* PK & Merek */}
            <View className="flex-row gap-4">
                <View className="flex-1">
                    <View className="flex-row">
                        <Text className="text-sm font-medium text-gray-700">Kapasitas (PK) </Text>
                        <Text className="text-red-500">*</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openSelectModal("Pilih PK", PK_OPTIONS.map(pk => ({ id: pk, name: pk })), (val) => onUpdate(unit.id, "pk", val.id))}
                        className="mt-2 border border-gray-300 rounded-lg p-3 flex-row justify-between items-center bg-white"
                    >
                        <Text className="text-base text-[#222222]">{unit.pk || "Pilih PK"}</Text>
                        <ChevronDown size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1">
                    <View className="flex-row">
                        <Text className="text-sm font-medium text-gray-700">Merek </Text>
                        <Text className="text-red-500">*</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openSelectModal("Pilih Merek", BRAND_OPTIONS.map(b => ({ id: b, name: b })), (val) => onUpdate(unit.id, "brand", val.id))}
                        className="mt-2 border border-gray-300 rounded-lg p-3 flex-row justify-between items-center bg-white"
                    >
                        <Text className="text-base text-[#222222]">{unit.brand || "Pilih Merek"}</Text>
                        <ChevronDown size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quantity */}
            <View className="flex-row justify-between items-center pt-2">
                <Text className="font-medium text-[#222222]">Jumlah Unit</Text>
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                        className="rounded-full border border-primary p-1"
                        onPress={() => onUpdate(unit.id, "quantity", Math.max(1, unit.quantity - 1))}
                    >
                        <Minus size={16} color="#057895" />
                    </TouchableOpacity>
                    <Text className="font-semibold text-lg text-[#222222]">{unit.quantity}</Text>
                    <TouchableOpacity
                        className="rounded-full border border-primary p-1"
                        onPress={() => onUpdate(unit.id, "quantity", unit.quantity + 1)}
                    >
                        <Plus size={16} color="#057895" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
