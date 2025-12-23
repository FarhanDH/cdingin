import React from "react";
import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

type EmailStepProps = {
    onSubmit: (data: { email: string }) => void;
    error?: string;
    loading: boolean;
};

export default function EmailStep({ onSubmit, error, loading }: EmailStepProps) {
    const { control, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
        mode: "onSubmit",
    });

    const isEmailValid = (email: string) => /\S+@\S+\.\S+/.test(email);

    return (
        <View className="flex-1 bg-white">
            <View className="space-y-6">
                <Text className="text-[20px] font-bold text-[#222222] mb-2">
                    Selamat datang di sidingin!
                </Text>
                <Text className="text-[#666666] text-sm mb-6">
                    Masuk atau daftar hanya dalam beberapa langkah mudah.
                </Text>

                <Controller
                    control={control}
                    name="email"
                    rules={{
                        required: "Email wajib diisi",
                        pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Format email tidak valid"
                        }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View>
                            <Text className="mb-2 font-medium text-gray-700">Email <Text className="text-destructive">*</Text></Text>

                            <Input
                                placeholder="Cth: namamu@domain.com"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                error={error || errors.email?.message}
                            />
                        </View>
                    )}
                />

                <Button
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isEmailValid || loading} className="w-full mt-2 h-[48.5px] active:scale-95"
                >
                    Lanjut
                </Button>
            </View>

            {/* Footer */}
            <View className="absolute bottom-9 left-0 right-0 items-center justify-center flex-row gap-1">
                <Text className="text-[#272727] text-xs">from </Text>
                <Text className="text-primary font-medium text-base">
                    Herdi Jaya Service
                </Text>
            </View>
        </View>
    );
}
