import { Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { getOrders } from "../../api/order";
import CustomerOrderCard from "../../components/customer/OrderCard";
import { CustomerOrderTabType, OrderItem } from "../../types/order";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";

// Tab definition
const TABS: { id: CustomerOrderTabType; label: string }[] = [
    { id: "progress", label: "Proses" },
    { id: "completed", label: "Selesai" },
    { id: "cancelled", label: "Dibatalkan" },
];

export default function OrderListScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<CustomerOrderTabType>("progress");
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getOrders(activeTab);
            setOrders(response.data.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrder = () => {
        // @ts-ignore
        navigation.navigate("NewOrder");
    };

    const handleOrderPress = (orderId: string) => {
        console.log("Navigate to Order Detail", orderId);
        // Navigation logic to be implemented
    };

    const renderEmptyState = () => (
        <View className="flex-1 justify-center items-center p-8 mt-0">
            {/* Using a placeholder view or image if available. 
                For now just text as in original but adapted for mobile */}
            <View className="w-full items-center justify-center">
                <Image
                    source={require("../../../assets/three-technicians.png")}
                    style={{ width: "100%", height: 250 }}
                    resizeMode="contain"
                />
            </View>
            <Text className="font-bold text-lg text-center mb-2 text-[#222222]">Masih sepi di sini!</Text>
            <Text className="text-gray-500 text-center font-light">
                Cuci, pasang, bongkar, dan servis AC? Semuanya bisa di sini. Cobain, yuk!
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 border-b border-gray-200 pt-4">
                <Text className="text-xl font-bold text-[#222222] mb-4">Daftar Pesanan</Text>

                {/* Tabs */}
                <View className="flex-row">
                    {TABS.map((tab) => (
                        <Button
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            className={`mr-6 bg-white rounded-none pb-3 ${activeTab === tab.id ? "border-b-2 border-primary" : ""}`}
                        >
                            <Text
                                className={`${activeTab === tab.id
                                    ? "text-primary font-bold"
                                    : "text-[#222222]"
                                    }`}
                            >
                                {tab.label}
                            </Text>
                        </Button>
                    ))}
                </View>
            </View>

            {/* List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#057895" />
                </View>
            ) : orders.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CustomerOrderCard order={item} onPress={handleOrderPress} />
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshing={loading}
                    onRefresh={fetchOrders}
                />
            )}

            {/* FAB */}
            <Button
                onPress={handleCreateOrder}
                className="absolute bottom-6 right-6 w-16 h-16 bg-primary rounded-xl items-center justify-center shadow-lg active:scale-95"
            >
                <Plus color="white" size={28} />
            </Button>
        </SafeAreaView>
    );
}
