import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Bell, Map, StickyNote, Wallet } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const Tab = createBottomTabNavigator();

// Placeholder screens
function MapScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-lg font-bold">Peta</Text>
        </View>
    );
}

function OrdersScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-lg font-bold">Pesanan (Teknisi)</Text>
        </View>
    );
}

function EarningsScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-lg font-bold">Pendapatan</Text>
        </View>
    );
}

function NotificationsScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-lg font-bold">Pemberitahuan</Text>
        </View>
    );
}

const PRIMARY_COLOR = "#057895";
const INACTIVE_COLOR = "#6b7280";

export default function TechnicianBottomNav() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: PRIMARY_COLOR,
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 5,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontFamily: "Rubik_500Medium",
                    fontSize: 12,
                },
            }}
        >
            <Tab.Screen
                name="Map"
                component={MapScreen}
                options={{
                    tabBarLabel: "Peta",
                    tabBarIcon: ({ color, focused }) => (
                        <View className="items-center">
                            <Map size={24} color={color} />
                            {focused && (
                                <View className="absolute -top-3 h-1 bg-primary rounded-b-full w-[40px]" />
                            )}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Orders"
                component={OrdersScreen}
                options={{
                    tabBarLabel: "Pesanan",
                    tabBarIcon: ({ color, focused }) => (
                        <View className="items-center">
                            <StickyNote size={24} color={color} />
                            {focused && (
                                <View className="absolute -top-3 h-1 bg-primary rounded-b-full w-[40px]" />
                            )}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Earnings"
                component={EarningsScreen}
                options={{
                    tabBarLabel: "Pendapatan",
                    tabBarIcon: ({ color, focused }) => (
                        <View className="items-center">
                            <Wallet size={24} color={color} />
                            {focused && (
                                <View className="absolute -top-3 h-1 bg-primary rounded-b-full w-[40px]" />
                            )}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    tabBarLabel: "Pemberitahuan",
                    tabBarIcon: ({ color, focused }) => (
                        <View className="items-center">
                            <Bell size={24} color={color} />
                            {focused && (
                                <View className="absolute -top-3 h-1 bg-primary rounded-b-full w-[40px]" />
                            )}
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
