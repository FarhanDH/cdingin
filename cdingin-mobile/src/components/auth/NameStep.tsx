import React from "react";
import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

type NameStepProps = {
    onSubmit: (data: { name: string }) => void;
    error?: string;
    loading: boolean;
};

export default function NameStep({ onSubmit, error, loading }: NameStepProps) {
    const { control, handleSubmit, formState: { isValid } } = useForm<{ name: string }>({
        mode: "onChange",
    });

    return (
        <View className="flex-1 bg-white">
            <View className="space-y-6">
                <Text className="text-[20px] font-bold text-[#222222] mb-2">
                    Nama kamu siapa?
                </Text>
                <Text className="text-[#666666] text-sm mb-6">
                    Biar lebih akrab, boleh tau nama kamu?
                </Text>

                <Controller
                    control={control}
                    name="name"
                    rules={{
                        required: "Nama wajib diisi",
                        pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message: "Nama hanya boleh berisi huruf alfabet"
                        }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View>
                            <Text className="mb-2 font-medium text-gray-700">Nama <Text className="text-destructive">*</Text></Text>

                            <Input
                                placeholder="Huruf alfabet, tanpa emoji/simbol"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={error}
                            />
                        </View>
                    )}
                />

                <Button
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || loading}
                    loading={loading}
                    className="w-full mt-2 h-[48.5px]"
                >
                    Lanjut
                </Button>
            </View>
        </View>
    );
}
