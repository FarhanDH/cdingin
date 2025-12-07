import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import EmailStep from "../components/auth/EmailStep";
import OtpStep from "../components/auth/OtpStep";
import NameStep from "../components/auth/NameStep";
import PhoneStep from "../components/auth/PhoneStep";
import { UserResponse } from "../types/auth";
import { sendOtp, verifyOtp, registerCustomer } from "../api/auth";
import { AxiosError } from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Navigate for now, or pass navigation prop
// import { useNavigation } from "@react-navigation/native"; 

interface AuthenticationProps {
    onExit: () => void;
}

export default function Authentication({ onExit }: AuthenticationProps) {
    const [step, setStep] = useState<"email" | "otp" | "name" | "phone">("email");
    const [user, setUser] = useState<UserResponse | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // const navigation = useNavigation();

    // Step 1: Email
    const handleEmailSubmit = async (data: { email: string }) => {
        setLoading(true);
        setError("");
        try {
            await sendOtp(data.email);
            setUser({ user: { email: data.email } });
            setStep("otp");
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message ?? "Yah, kayaknya ada yang salah. Coba lagi nanti, ya");
            } else {
                setError("Terjadi kesalahan jaringan.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: OTP
    const handleOtpSubmit = async (data: { otp: string }) => {
        setLoading(true);
        try {
            if (!user?.user.email) return;
            const response = await verifyOtp(user.user.email, data.otp);

            if (response.data.data?.isNewUser) {
                setUser({
                    ...user,
                    isNewUser: true,
                });
                setStep("name");
            } else {
                setUser({ user: response.data.data.user, isNewUser: false });
                // navigation.navigate("Orders"); // TODO: Navigate to Orders
                console.log("Navigate to Orders (Existing User)");
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message ?? "Yah, kayaknya ada yang salah. Coba lagi nanti, ya");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            if (!user?.user.email) return;
            await sendOtp(user.user.email);
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message ?? "Gagal mengirim ulang OTP.");
            }
        }
    };

    // Step 3: Name
    const handleNameSubmit = async (data: { name: string }) => {
        if (!user) return;
        setUser({
            ...user,
            user: { ...user.user, fullName: data.name },
        });
        setStep("phone");
    };

    // Step 4: Phone
    const handlePhoneSubmit = async (data: { phone: string }) => {
        setLoading(true);
        setError("");
        try {
            if (!user?.user.email || !user?.user.fullName) return;
            const response = await registerCustomer({
                email: user.user.email,
                fullName: user.user.fullName,
                phoneNumber: data.phone
            });
            setUser(response.data.data);
            // navigation.navigate("Orders"); // TODO: Navigate to Orders
            console.log("Navigate to Orders (New User Registered)");

        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message ?? "Yah, kayaknya ada yang salah. Coba lagi nanti, ya");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === "email") {
            onExit();
            // navigation.goBack();
            console.log("Back from Email step");
        } else {
            setStep("email"); // Simplification: back to email or previous logical step
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-4 pt-4">
                <TouchableOpacity onPress={handleBack} className="mb-8 w-8 h-8 justify-center">
                    <ArrowLeft size={24} color="#222222" />
                </TouchableOpacity>

                {step === "email" && (
                    <EmailStep onSubmit={handleEmailSubmit} error={error} loading={loading} />
                )}
                {step === "otp" && (
                    <OtpStep
                        onSubmit={handleOtpSubmit}
                        onResend={handleResendOtp}
                        email={user?.user.email}
                        error={error}
                        onClearError={() => setError("")}
                        loading={loading}
                    />
                )}
                {step === "name" && (
                    <NameStep onSubmit={handleNameSubmit} error={error} loading={loading} />
                )}
                {step === "phone" && (
                    <PhoneStep onSubmit={handlePhoneSubmit} loading={loading} error={error} />
                )}
            </View>

            {loading && (
                <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center z-50">
                    <View className="bg-white p-6 rounded-lg">
                        <ActivityIndicator size="large" color="#057895" />
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
