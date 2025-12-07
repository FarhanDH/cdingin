import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import { StickyNote, Bell } from "lucide-react-native";

const Tab = createBottomTabNavigator();

import OrderListScreen from "../screens/customer/OrderListScreen";

// Placeholder screens

function NotificationsScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-lg font-bold">Pemberitahuan</Text>
        </View>
    );
}

// TODO: Fix colors import or use hardcoded token values for now matching tailwind config
const PRIMARY_COLOR = "#057895";
const SECONDARY_COLOR = "#01a2c6";
const INACTIVE_COLOR = "#6b7280"; // gray-500

export default function CustomerBottomNav() {
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
                name="Orders"
                component={OrderListScreen}
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
