import { TextInput, TextInputProps, View, Text } from "react-native";
import { cn } from "../../lib/utils";
import { ControllerRenderProps } from "react-hook-form";

interface InputProps extends TextInputProps {
    className?: string; // Add className prop explicitly
    containerClassName?: string;
    error?: string;
    label?: string;
}

export function Input({ className, containerClassName, error, label, ...props }: InputProps) {
    return (
        <View className={cn("mb-4", containerClassName)}>
            {label && <Text className="mb-2 font-medium text-gray-700">{label}</Text>}
            <TextInput
                className={cn(
                    "w-full border-b border-[#a7a7a7] pb-2 text-[16px] font-medium tracking-wide text-[#222222]",
                    "focus:border-[#222222] focus:outline-none",
                    error && "border-destructive text-destructive",
                    className
                )}
                placeholderTextColor="#a7a7a7"
                {...props}
            />
            {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
        </View>
    );
}
