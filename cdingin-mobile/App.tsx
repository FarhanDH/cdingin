import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useFonts, Rubik_300Light, Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold } from '@expo-google-fonts/rubik';
import Authentication from './src/screens/Authentication';
import Welcome from './src/screens/Welcome';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "auth">("welcome");

  let [fontsLoaded] = useFonts({
    Rubik_300Light,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#057895" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {currentScreen === "welcome" ? (
        <Welcome onNavigateAuth={() => setCurrentScreen("auth")} />
      ) : (
        <Authentication onExit={() => setCurrentScreen("welcome")} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}
