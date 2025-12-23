import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, Text } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import EmailStep from "../components/auth/EmailStep";
import OtpStep from "../components/auth/OtpStep";
import NameStep from "../components/auth/NameStep";
import PhoneStep from "../components/auth/PhoneStep";
import { UserResponse } from "../types/auth";
import { sendOtp, verifyOtp, registerCustomer } from "../api/auth";
import { AxiosError } from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { saveAuthData } from "../utils/storage";

interface AuthenticationProps {
    onExit: () => void;
    onSuccess: (role: "customer" | "technician") => void;
}

export default function Authentication({ onExit, onSuccess }: AuthenticationProps) {
    const [step, setStep] = useState<"email" | "otp" | "name" | "phone">("email");
    const [user, setUser] = useState<UserResponse | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000); // Hide after 3 seconds
    };

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
                const loggedInUser = response.data.data.user;
                const tokens = response.data.data.tokens;

                setUser({ user: loggedInUser, isNewUser: false });
                console.log("Navigate to Orders (Existing User)", loggedInUser.role);
                const role = loggedInUser.role as "customer" | "technician" || "customer";
                const name = loggedInUser.fullName || loggedInUser.email;

                if (tokens?.accessToken) {
                    await saveAuthData({
                        accessToken: tokens.accessToken,
                        role: role,
                        userName: name
                    });
                }

                if (role === "customer") {
                    showToast(`Heyyoo, ${name}!`);
                } else if (role === "technician") {
                    showToast(`Selamat datang, Teknisi ${name}!`);
                }
                onSuccess(role);
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
            // Use existing phone number if available in user object (from name step update?) no, usually passed in data
            // But if we want to be safe, use data.phone
            const response = await registerCustomer({
                email: user.user.email,
                fullName: user.user.fullName,
                phoneNumber: data.phone
            });
            const registeredUser = response.data.data;
            const tokens = registeredUser.tokens;

            setUser(registeredUser);
            console.log("Navigate to Orders (New User Registered)", registeredUser.user.role);
            const role = registeredUser.user.role as "customer" | "technician" || "customer";
            const name = registeredUser.user.fullName || registeredUser.user.email;

            if (tokens?.accessToken) {
                await saveAuthData({
                    accessToken: tokens.accessToken,
                    role: role,
                    userName: name
                });
            }

            if (role === "customer") {
                showToast(`Heyyoo, ${name}!`);
            } else if (role === "technician") {
                showToast(`Selamat datang, Teknisi ${name}!`);
            }
            onSuccess(role);
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
            console.log("Back from Email step");
        } else {
            setStep("email");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-4 pt-4">
                <Button onPress={handleBack} className="mb-8 w-8 h-8 justify-center bg-white">
                    <ArrowLeft size={24} color="#222222" />
                </Button>

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

            {toastMessage && (
                <View className="absolute top-0 left-0 right-0 p-4 bg-green-500 items-center justify-center z-50">
                    <Text className="text-white text-base font-semibold">{toastMessage}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}
