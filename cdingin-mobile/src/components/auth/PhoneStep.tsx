import React, { useEffect, useState } from "react";
import { View, Text, Modal, Image, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { SvgXml } from "react-native-svg";

// Simple ID flag SVG representation or use a library. 
// For now using a text holder or simple view to emulate the flag/prefix.
const IDFlag = () => (
    <View className="w-6 h-4 bg-red-600 border border-gray-200" style={{ borderBottomWidth: 8, borderBottomColor: "white" }} />
);

type PhoneStepProps = {
    onSubmit: (data: { phone: string }) => void;
    loading: boolean;
    error?: string;
};

export default function PhoneStep({ onSubmit, loading, error }: PhoneStepProps) {
    const { control, handleSubmit, formState: { isValid }, watch } = useForm<{ phone: string }>({
        mode: "onChange",
    });
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsSheetOpen(true), 850);
    }, []);

    // NOTE: 'public/whatsapp-telephone.png' needs to be in assets or linked properly.
    // For now assuming it's available or using a placeholder.
    // const phoneWhatsapp = require("../../../assets/whatsapp-telephone.png"); 

    return (
        <View className="flex-1 bg-white">
            <View className="space-y-6">
                <Text className="text-[20px] font-bold text-[#222222] mb-2">
                    Nomor HP kamu berapa?
                </Text>
                <Text className="text-[#666666] text-sm mb-6">
                    Boleh tau nomor HP kamu? Biar teknisi bisa hubungi kamu!
                </Text>

                <Controller
                    control={control}
                    name="phone"
                    rules={{
                        required: "Nomor HP wajib diisi",
                        pattern: {
                            value: /^[0-9]+$/,
                            message: "Nomor HP harus berupa angka"
                        },
                        minLength: { value: 8, message: "Minimal 8 digit" },
                        maxLength: { value: 15, message: "Maksimal 15 digit" }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="mb-2 font-medium text-gray-700">Nomor HP <Text className="text-destructive">*</Text></Text>
                            <View className="flex-row items-center gap-3 w-full">

                                <View className="flex-row gap-1 justify-center items-center bg-gray-100 rounded-full border border-gray-300 h-10 px-3">
                                    <View className="w-5 h-3 bg-red-500 overflow-hidden relative">
                                        <View className="absolute top-1.5 bottom-0 left-0 right-0 bg-white" />
                                    </View>
                                    <Text className="text-sm font-medium ml-1">+62</Text>
                                </View>
                                <Input
                                    containerClassName="flex-1"
                                    className="text-gray-900"
                                    placeholder="81x-xxx-xxx"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType="phone-pad"
                                    maxLength={15}
                                />
                            </View>
                            {error && <Text className="text-destructive text-sm">{error}</Text>}
                        </View>
                    )}
                />

                <Button
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || loading}
                    loading={loading}
                    className="w-full h-[48px]"
                >
                    Lanjut
                </Button>
            </View>

            {/* Bottom Sheet / Modal for Whatsapp Info */}
            <Modal
                transparent={true}
                visible={isSheetOpen}
                animationType="slide"
                onRequestClose={() => { }} // Block back button close if desired
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl px-4 pb-6 items-center">
                        {/* Image Placeholder */}
                        <View className="w-full mb items-center justify-center">
                            <Image
                                source={require("../../../assets/whatsapp-telephone.png")}
                                style={{ width: "100%", height: 250 }}
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-xl font-bold text-center mb-2">
                            Pastiin nomor HP-nya nyambung ke WhatsApp ya
                        </Text>
                        <Text className="text-base text-gray-600 text-center mb-4">
                            Teknisi biasanya hubungi pelanggan lewat WhatsApp, biar komunikasi lebih gampang dan pesananmu cepet diproses.
                        </Text>
                        <Button
                            onPress={() => setIsSheetOpen(false)}
                            className="w-full rounded-full h-[48px]"
                        >
                            Oke, siap
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
