import { View, ViewStyle, StyleProp } from "react-native";
import { Text } from "./Themed";
import { ReactNode } from "react";

interface GenericStrikeAround {
  containerStyles?: StyleProp<ViewStyle>;
  children: string | ReactNode;
  className?: string;
}

/**
 * Pass in a string to render as <Text className="text-xl">{children}</Text>
 * Or pass in a node
 */
export default function GenericStrikeAround({
  containerStyles,
  children,
  className,
}: GenericStrikeAround) {
  return (
    <View className={`flex-row items-center ${containerStyles || ""}`}>
      <View className="flex-1 border-t border-gray-800 dark:border-gray-300" />
      <View className="mx-2.5">
        {typeof children === "string" ? (
          <Text className={className || "text-xl"}>{children}</Text>
        ) : (
          children
        )}
      </View>
      <View className="flex-1 border-t border-gray-800 dark:border-gray-300" />
    </View>
  );
}
