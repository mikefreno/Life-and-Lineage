import { type ReactNode } from "react";
import { View } from "react-native";
import { ThemedView } from "./Themed";

interface ThemedCard {
  children?: ReactNode;
  className?: string;
}
export default function ThemedCard({ children, className = "" }: ThemedCard) {
  return (
    <View className={`m-2 rounded-xl ${className}`}>
      <ThemedView
        className="flex justify-between rounded-xl px-4 py-2 shadow dark:border dark:border-zinc-500 shadow-black/20 android:shadow-black/90"
        style={{ elevation: 3 }}
      >
        {children}
      </ThemedView>
    </View>
  );
}
