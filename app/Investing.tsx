import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import investments from "../assets/json/investments.json";

import { View } from "../components/Themed";

import "../assets/styles/globals.css";

export default function InvestingScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
