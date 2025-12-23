import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import SuccessIllustration from "../../../assets/success.json";

// Components
import AcTypeStep from "../../components/order/new/AcTypeStep";
import LocationStep from "../../components/order/new/LocationStep";
import ProblemsStep from "../../components/order/new/ProblemsStep";
import PropertyTypeStep from "../../components/order/new/PropertyTypeStep";
import SummaryStep from "../../components/order/new/SummaryStep";

// Types & API
import { AxiosError } from "axios";
import { createOrder } from "../../api/order";
import { CreateOrderRequestDto, OrderFormData, OrderStep } from "../../types/order";
import { SafeAreaView } from "react-native-safe-area-context";

// Step Order Definition
const STEP_ORDER: OrderStep[] = ["ac-problems", "location", "property-type", "ac-type", "summary"];

export default function NewOrderScreen() {
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState<OrderStep>("ac-problems");
    const [formData, setFormData] = useState<Partial<OrderFormData>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleNext = () => {
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
            setCurrentStep(STEP_ORDER[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(STEP_ORDER[currentIndex - 1]);
        } else {
            navigation.goBack();
        }
    };

    const navigateToStep = (step: OrderStep) => {
        setCurrentStep(step);
    };

    // Step Handlers
    const handleProblemsSubmit = (data: { problems: string[] }) => {
        setFormData(prev => ({ ...prev, problems: data.problems }));
        handleNext(); // Auto next
    };

    const handleLocationSubmit = (data: { latitude: number; longitude: number; address: string; note: string }) => {
        setFormData(prev => ({ ...prev, serviceLocation: data }));
        handleNext();
    };

    const handlePropertyTypeSubmit = (data: { propertyType: any; floor: number }) => {
        setFormData(prev => ({ ...prev, ...data }));
        handleNext();
    };

    const handleAcTypeSubmit = (data: { acUnits: any[] }) => {
        setFormData(prev => ({ ...prev, acUnits: data.acUnits }));
        handleNext();
    };

    const handleUpdateQuantity = (unitId: string, newQuantity: number) => {
        setFormData(prev => ({
            ...prev,
            acUnits: prev.acUnits?.map(unit =>
                unit.id === unitId ? { ...unit, quantity: newQuantity } : unit
            ).filter(unit => unit.quantity > 0) // Remove if 0
        }));
    };

    const handleConfirmOrder = async (data: { serviceDate: Date; note: string }) => {
        setLoading(true);
        try {
            // Helper to validate data existence before sending
            if (!formData.problems || !formData.serviceLocation || !formData.propertyType || !formData.acUnits) {
                Alert.alert("Data Tidak Lengkap", "Mohon lengkapi semua data pesanan.");
                return;
            }

            const payload: CreateOrderRequestDto = {
                acProblems: formData.problems,
                serviceLocation: {
                    latitude: formData.serviceLocation.latitude,
                    longitude: formData.serviceLocation.longitude,
                    address: formData.serviceLocation.address,
                    note: formData.serviceLocation.note,
                },
                propertyType: formData.propertyType.name, // BE usually expects name or ID, confirmed web matches name usually or ID depending on context. Using name as safer default for display-based APIs, or check swagger.
                floor: formData.floor || 0,
                acUnits: formData.acUnits
                    .filter(unit => unit.acType !== null)
                    .map(unit => ({
                        acTypeId: unit.acType!.id,
                        acCapacity: unit.pk,
                        brand: unit.brand,
                        quantity: unit.quantity
                    })),
                serviceDate: data.serviceDate.toISOString().split('T')[0], // YYYY-MM-DD
                note: data.note,
            };

            await createOrder(payload);
            setSuccess(true);

            // Navigate away after animation
            setTimeout(() => {
                // Return to home/orders
                // @ts-ignore
                navigation.navigate("CustomerRoot");
            }, 3000);

        } catch (error) {
            if (error instanceof AxiosError) {
                Alert.alert("Gagal", error.response?.data?.message || "Terjadi kesalahan saat membuat pesanan.");
            } else {
                Alert.alert("Error", "Gagal membuat pesanan.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <LottieView
                    source={SuccessIllustration} // Verify path correctness
                    autoPlay
                    loop={false}
                    style={{ width: 300, height: 300 }}
                />
                <Text className="text-xl font-bold text-primary mt-8">Pesanan Berhasil!</Text>
                <Text className="text-gray-500 mt-2">Teknisi kami akan segera meluncur.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                {/* Header - Only show on steps where we aren't in a immersive map or similar if desired, but consistently showing is good for Back */}
                <View className="px-4 py-3 border-b border-gray-100 flex-row items-center relative z-10 bg-white">
                    <TouchableOpacity onPress={handlePrev} className="w-10 h-10 justify-center items-start">
                        <ChevronLeft size={28} color="#222222" />
                    </TouchableOpacity>
                    <View className="flex-1 items-center mr-10">
                        <Text className="text-lg font-bold text-[#222222] capitalize">
                            {currentStep === "summary" ? "Ringkasan" : "Buat Pesanan"}
                        </Text>
                    </View>
                </View>

                {/* Steps */}
                <View className="flex-1">
                    {currentStep === "ac-problems" && (
                        <ProblemsStep
                            initialProblems={formData.problems || []}
                            onSubmit={handleProblemsSubmit}
                        />
                    )}

                    {currentStep === "location" && (
                        <LocationStep
                            initialLocation={formData.serviceLocation}
                            onSubmit={handleLocationSubmit}
                            onBack={handlePrev}
                        />
                    )}

                    {currentStep === "property-type" && (
                        <PropertyTypeStep
                            initialPropertyType={formData.propertyType}
                            initialFloor={formData.floor}
                            onSubmit={handlePropertyTypeSubmit}
                            onBack={handlePrev}
                        />
                    )}

                    {currentStep === "ac-type" && (
                        <AcTypeStep
                            initialAcUnits={formData.acUnits || []}
                            onSubmit={handleAcTypeSubmit}
                            onBack={handlePrev}
                        />
                    )}

                    {currentStep === "summary" && (
                        <SummaryStep
                            formData={formData}
                            onConfirm={handleConfirmOrder}
                            onUpdateQuantity={handleUpdateQuantity}
                            navigateToStep={navigateToStep}
                        />
                    )}
                </View>

                {/* Global Loading Overlay */}
                <Modal visible={loading} transparent>
                    <View className="flex-1 bg-black/50 items-center justify-center">
                        <View className="bg-white p-5 rounded-xl">
                            <ActivityIndicator size="large" color="#057895" />
                            <Text className="mt-4 font-medium text-gray-700">Mohon tunggu...</Text>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
