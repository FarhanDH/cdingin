import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Linking, Text, TextInput, Vibration, View } from "react-native";
import { Button } from "../ui/Button";

type OtpStepProps = {
    onSubmit: (data: { otp: string }) => void;
    email?: string;
    error?: string;
    onClearError: () => void;
    loading: boolean;
    onResend: () => void;
};

export default function OtpStep({
    onSubmit,
    email,
    error,
    onClearError,
    loading,
    onResend,
}: OtpStepProps) {
    const { control, handleSubmit, formState: { isValid } } = useForm<{ otp: string }>({
        mode: "onChange",
    });
    const [seconds, setSeconds] = useState(59);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (seconds > 0) {
            timerRef.current = setTimeout(() => setSeconds((s) => s - 1), 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [seconds]);

    useEffect(() => {
        setSeconds(59);
    }, [email]);

    useEffect(() => {
        if (error) {
            Vibration.vibrate();
        }
    }, [error]);

    const handleOpenEmail = async () => {
        const url = "https://mail.google.com/mail/mu/mp/679/#";
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert("Info", "Tidak dapat membuka aplikasi email secara otomatis.");
        }
    };

    return (
        <View className="bg-white flex-1">
            <View className="space-y-6">
                <Text className="text-[20px] font-bold text-[#222222] mb-2">
                    Cek email, ya
                </Text>
                <Text className="text-[#666666] text-sm mb-6">
                    Kode-nya kami kirim ke {email}
                </Text>

                <Controller
                    control={control}
                    name="otp"
                    rules={{ required: true, minLength: 4, maxLength: 4 }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
                            <Text className="mb-2 font-medium text-gray-700">OTP <Text className="text-destructive">*</Text></Text>
                            <TextInput
                                className={`w-full border-b pb-2 text-lg font-medium tracking-[10px] ${error ? "border-b-destructive text-destructive" : "border-[#a7a7a7] text-black"} focus:outline-none focus:border-[#222222]`}
                                placeholder="••••"
                                placeholderTextColor="#a7a7a7"
                                onBlur={onBlur}
                                onChangeText={(text) => {
                                    onChange(text);
                                    if (error) onClearError();
                                    if (text.length === 4) {
                                        handleSubmit(onSubmit)();
                                    }
                                }}
                                value={value}
                                keyboardType="number-pad"
                                maxLength={4}
                            />
                            <View className="flex-row justify-between items-start -mt-14">
                                <Text className="text-destructive text-sm flex-1 mt-16 mr-2">{error}</Text>
                                {seconds > 0 ? (
                                    <View className="flex-row items-center mt-4">
                                        <Text className="text-base font-semibold text-gray-900">
                                            0:{seconds.toString().padStart(2, "0")}
                                        </Text>
                                        <ActivityIndicator className="ml-2 text-secondary" />
                                    </View>
                                ) : (
                                    <Button
                                        onPress={() => {
                                            setSeconds(59);
                                            onResend();
                                        }}
                                        className="bg-secondary h-11 text-white rounded-full text-xs font-semibold cursor-pointer active:scale-95"
                                    >
                                        Kirim Ulang
                                    </Button>
                                )}
                            </View>
                        </View>
                    )}
                />

                <Button
                    variant="outline"
                    onPress={handleOpenEmail}
                    className="w-[32%] rounded-full border border-primary -mt-2 h-11"
                >
                    Buka Email
                </Button>
            </View>
        </View>
    );
}
