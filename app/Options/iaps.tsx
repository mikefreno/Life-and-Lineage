import React, { useContext } from "react";
import { View } from "react-native";
import { Text } from "../../components/Themed";
import { AppContext } from "../_layout";
import GenericAnimatedPressable from "../../components/GenericAnimatedButton";

export default function InAppPurchasePage() {
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { dimensions } = appData;

  return (
    <View
      className="flex-1 items-start mt-16"
      style={{ paddingHorizontal: dimensions.width * 0.1 }}
    >
      <GenericAnimatedPressable>
        <Text className="text-lg text-center">
          Unlock both the Ranger and the Necromancer
        </Text>
        <Text className="text-lg">($2.99)</Text>
      </GenericAnimatedPressable>
      <View>
        <Text className="text-lg">
          {"\u2022"}$1.99 for the Ranger Or the Necromancer
        </Text>
      </View>
      <View>
        <Text className="text-lg">
          {"\u2022"}$0.99 for cloud saves - offsets server costs - free with a
          class purchase
        </Text>
      </View>
    </View>
  );
}
