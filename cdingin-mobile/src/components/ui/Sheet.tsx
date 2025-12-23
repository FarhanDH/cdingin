import { X } from "lucide-react-native";
import React, { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils";

interface SheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

const SheetContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
} | null>(null);

function Sheet({ open, onOpenChange, children }: SheetProps) {
    return (
        <SheetContext.Provider value={{ open, setOpen: onOpenChange }}>
            <Modal
                transparent
                visible={open}
                animationType="slide"
                onRequestClose={() => onOpenChange(false)}
            >
                {children}
            </Modal>
        </SheetContext.Provider>
    );
}

// In RN, Trigger is often external state managment, but we can have it if needed. 
// For now, we rely on the `Modal` structure where Content acts as the visible part.
function SheetTrigger({ children }: { children: ReactNode }) {
    // In strict RN Modal pattern, trigger is largely external. 
    // This component is kept for API compatibility if we wrap logic differently later.
    return <>{children}</>;
}

interface SheetContentProps {
    children: ReactNode;
    className?: string;
    isXIconVisible?: boolean;
    side?: "bottom"; // Only "bottom" relevant for standard mobile sheet usually
}

function SheetContent({ children, className, isXIconVisible = true }: SheetContentProps) {
    const context = React.useContext(SheetContext);
    if (!context) throw new Error("SheetContent must be used within a Sheet");
    const { setOpen } = context;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 justify-end"
        >
            {/* Overlay - tap to close */}
            <Pressable
                className="absolute inset-0 bg-black/50"
                onPress={() => setOpen(false)}
            />

            {/* Content Card */}
            <View className={cn("bg-white rounded-t-3xl min-h-[30%] w-full shadow-xl relative", className)}>
                {/* Close Button */}
                {isXIconVisible && (
                    <Pressable
                        onPress={() => setOpen(false)}
                        className="absolute right-4 -top-[50px] z-50 bg-gray-100 p-2 rounded-full active:scale-95 "
                    >
                        <X size={23} color="#222222" />
                    </Pressable>
                )}

                {/* Content Container */}
                <View className="px-2 py-4">
                    {children}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

function SheetHeader({ className, children }: { className?: string; children: ReactNode }) {
    return <View className={cn("px-6 pt-6 pb-2", className)}>{children}</View>;
}

function SheetFooter({ className, children }: { className?: string; children: ReactNode }) {
    return <View className={cn("p-6 pt-2 mt-auto", className)}>{children}</View>;
}

function SheetTitle({ className, children }: { className?: string; children: ReactNode }) {
    return <Text className={cn("text-xl font-bold text-[#222222] text-center", className)}>{children}</Text>;
}

function SheetDescription({ className, children }: { className?: string; children: ReactNode }) {
    return <Text className={cn("text-gray-500 text-sm text-center mt-1", className)}>{children}</Text>;
}

export {
    Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger
};

