import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, Rubik_300Light, Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';

// Screens
import Authentication from './src/screens/Authentication';
import Welcome from './src/screens/Welcome';
import NewOrderScreen from './src/screens/customer/NewOrderScreen';

// Navigation
import CustomerBottomNav from './src/navigation/CustomerBottomNav';
import TechnicianBottomNav from './src/navigation/TechnicianBottomNav';

// Utils
import { getAuthData, AuthData } from './src/utils/storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    Rubik_300Light,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const authData = await getAuthData();
      if (authData?.accessToken && authData?.role) {
        if (authData.role === 'technician') {
          setInitialRoute('TechnicianRoot');
        } else {
          setInitialRoute('CustomerRoot');
        }
      } else {
        setInitialRoute('Welcome');
      }
    };

    checkAuth();
  }, []);

  if (!fontsLoaded || !initialRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#057895" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Welcome">
          {(props) => <Welcome {...props} onNavigateAuth={() => props.navigation.navigate('Authentication')} />}
        </Stack.Screen>
        <Stack.Screen name="Authentication">
          {(props) => (
            <Authentication
              {...props}
              onExit={() => props.navigation.goBack()}
              onSuccess={(role) => {
                console.log("Auth Success, Role:", role);
                if (role === 'technician') {
                  props.navigation.replace('TechnicianRoot');
                } else {
                  props.navigation.replace('CustomerRoot');
                }
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="CustomerRoot" component={CustomerBottomNav} />
        <Stack.Screen name="TechnicianRoot" component={TechnicianBottomNav} />
        <Stack.Screen name="NewOrder" component={NewOrderScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
