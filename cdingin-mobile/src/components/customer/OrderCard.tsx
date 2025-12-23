import React from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { OrderItem } from "../../types/order";
import { getStatusLabel } from "../../lib/order";
import { ChevronRight, Wind } from "lucide-react-native";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

interface CustomerOrderCardProps {
    order: OrderItem;
    onPress: (orderId: string) => void;
}

export default function CustomerOrderCard({ order, onPress }: CustomerOrderCardProps) {
    const { text: statusText, bgColor: statusColor, textColor } = getStatusLabel(order.status);

    // Formatting date (Simple implementation)
    const date = new Date(order.serviceDate);
    const formatDate = date.toLocaleDateString("id-ID", {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <Pressable
            onPress={() => onPress(order.id)}
            className="border-b border-gray-200 bg-white p-4"
        >
            {/* Top Section */}
            <View className="flex-row justify-between mb-2 pb-2 border-b border-gray-100">
                <View>
                    <Text className="font-bold text-base text-[#222222]">{order.id.substring(0, 8).toUpperCase()}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{formatDate}</Text>
                    <Text className="text-gray-500 text-sm">{order.propertyType}</Text>
                </View>

                <View className="items-end">
                    <ChevronRight size={18} color="#888" />
                    <View className={cn("px-3 py-1 rounded-sm mt-2", statusColor)}>
                        <Text className={cn("text-xs font-medium text-white")}>
                            {statusText}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Bottom Section */}
            <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-500 flex-1 mr-4" numberOfLines={1}>
                    {order.problems.join(", ")}
                </Text>
                <View className="flex-row items-center">
                    <Wind size={16} color="#6b7280" className="mr-1" />
                    <Text className="text-sm text-gray-500">{order.totalUnits} Unit</Text>
                </View>
            </View>
        </Pressable>
    );
}
