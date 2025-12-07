import React from "react";
import { Image, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";

// Import asset. Make sure typescript knows about .png if strict or use require.
// const heroImage = require("../../assets/home-page.png");

interface WelcomeProps {
    onNavigateAuth: () => void;
}

export default function Welcome({ onNavigateAuth }: WelcomeProps) {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 py-4 flex-col justify-between">

                {/* Logo Section */}
                <View className="flex flex-row items-center gap-2 mt-2 w-full">
                    <Image source={require("../../assets/logo.png")} className="w-8 h-8" style={{ width: 40, height: 40 }} />
                    <Text className="text-xl font-bold text-[#222222]">sidingin</Text>
                </View>

                {/* Hero Section */}
                <View className="flex-1 justify-center items-center">
                    <Image
                        source={require("../../assets/home-page.png")}
                        // className="w-full h-64 mb-6"
                        style={{ width: "100%", height: 200 }}
                        resizeMode="contain"
                    />
                    <Text className="text-2xl font-bold text-center text-[#222222] my-3">
                        Selamat datang di sidingin!
                    </Text>
                    <Text className="text-base font-light text-center text-[#666666] leading-6 px-2">
                        Cukup AC aja yang dingin, kamu jangan. Servis AC jadi gampang tinggal klik, beres!
                    </Text>
                </View>

                {/* Action Buttons */}
                <View className="w-full flex-col gap-4 mb-4">
                    <Button
                        onPress={onNavigateAuth}
                        className="w-full rounded-full bg-primary h-[48.5px]"
                    >
                        Masuk
                    </Button>
                    <Button
                        variant="outline"
                        onPress={onNavigateAuth}
                        className="w-full rounded-full border-[1.5px] border-[#006C7F] h-[48.5px]"
                    >
                        Belum Ada Akun? Daftar Dulu
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
}
