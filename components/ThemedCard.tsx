import { type ReactNode } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import Colors from "../constants/Colors";
import { useColorScheme } from "nativewind";

interface ThemedCard {
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}
export default function ThemedCard({ children, className = "" }: ThemedCard) {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className={`m-2 rounded-xl ${className}`}
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 3,
          height: 1,
        },
        elevation: 3,
        shadowOpacity: 0.2,
        shadowRadius: 3,
      }}
    >
      <View
        className="flex justify-between rounded-xl px-4 py-2 dark:border dark:border-zinc-500"
        style={{ backgroundColor: Colors[colorScheme].accent }}
      >
        {children}
      </View>
    </View>
  );
}
