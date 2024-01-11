import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import investments from "../assets/json/investments.json";

import { View } from "../components/Themed";

import "../assets/styles/globals.css";
import { Investment } from "../utility/types";

export default function InvestingScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      {investments.map((investment: Investment) => (
        <View></View>
      ))}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
