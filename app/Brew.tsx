import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import "../assets/styles/globals.css";

export default function BrewingScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="bold text-xl">Brewing</Text>
      <View className="my-8 h-0.5 w-4/5 text-zinc-100 dark:text-zinc-700" />
      <EditScreenInfo path="app/craft.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
