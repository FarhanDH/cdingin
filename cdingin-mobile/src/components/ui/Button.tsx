import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from "react-native";
import { cn } from "../../lib/utils";

interface ButtonProps extends TouchableOpacityProps {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    loading?: boolean;
    className?: string; // Add className prop explicitly
    textClassName?: string;
}

export function Button({
    className,
    variant = "primary",
    size = "default",
    loading = false,
    children,
    disabled,
    textClassName,
    ...props
}: ButtonProps) {
    const baseStyles = "flex-row items-center justify-center rounded-full font-semibold active:scale-95";

    const variants = {
        primary: "bg-primary",
        secondary: "bg-gray-200",
        outline: "border border-primary bg-transparent",
        ghost: "bg-transparent",
    };

    const sizes = {
        default: "h-12 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-md px-8",
        icon: "h-10 w-10",
    };

    const textVariants = {
        primary: "text-white",
        secondary: "text-[#222222]",
        outline: "text-primary",
        ghost: "text-[#222222]",
    };

    // cdingin-app specific primary color override if needed
    // Assuming primary is custom, let's stick to tailwind classes for now.
    // In web it was 'bg-primary', we can map that in tailwind.config.js later.
    // For now using arbitrary value or closest match.
    // Web Primary: usually a blue/cyan. Let's assume blue-500 or check tailwind config.

    return (
        <TouchableOpacity
            activeOpacity={1}
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                disabled && "opacity-50",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#057895" : "white"} />
            ) : (
                typeof children === "string" ? (
                    <Text className={cn("font-bold text-base", textVariants[variant], textClassName)}>
                        {children}
                    </Text>
                ) : children
            )}
        </TouchableOpacity>
    );
}
