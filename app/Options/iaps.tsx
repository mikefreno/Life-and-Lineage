import { View } from "react-native";
import { Text } from "../../components/Themed";
import GenericAnimatedPressable from "../../components/GenericAnimatedButton";
import { useRootStore } from "../../hooks/stores";
import { text, tw_base } from "../../hooks/styles";

export default function InAppPurchasePage() {
  const { uiStore } = useRootStore();

  return (
    <View
      style={{
        paddingHorizontal: uiStore.dimensions.width * 0.1,
        flex: 1,
        marginTop: tw_base[16],
        alignItems: "flex-start",
      }}
    >
      <GenericAnimatedPressable>
        <Text style={{ ...text.lg, textAlign: "center" }}>
          Unlock both the Ranger and the Necromancer
        </Text>
        <Text style={text.lg}>($2.99)</Text>
      </GenericAnimatedPressable>
      <View>
        <Text style={text.lg}>
          {"\u2022"}$1.99 for the Ranger Or the Necromancer
        </Text>
      </View>
      <View>
        <Text style={text.lg}>
          {"\u2022"}$0.99 for cloud saves - offsets server costs - free with a
          class purchase
        </Text>
      </View>
    </View>
  );
}
