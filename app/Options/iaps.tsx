import { View } from "react-native";
import { Text } from "../../components/Themed";
import GenericAnimatedPressable from "../../components/GenericAnimatedButton";
import { useRootStore } from "../../hooks/stores";

export default function InAppPurchasePage() {
  const { uiStore } = useRootStore();

  return (
    <View
      className="flex-1 items-start mt-16"
      style={{ paddingHorizontal: uiStore.dimensions.window.width * 0.1 }}
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
