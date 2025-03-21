import { View } from "react-native";
import { Text } from "@/components/Themed";
import GenericAnimatedPressable from "@/components/GenericAnimatedButton";
import { useRootStore } from "@/hooks/stores";
import { tw_base, useStyles } from "@/hooks/styles";

export default function InAppPurchasePage() {
  const { uiStore } = useRootStore();
  const styles = useStyles();

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
        <Text style={{ ...styles["text-lg"], textAlign: "center" }}>
          Unlock both the Ranger and the Necromancer
        </Text>
        <Text style={styles["text-lg"]}>($2.99)</Text>
      </GenericAnimatedPressable>
      <View>
        <Text style={styles["text-lg"]}>
          {"\u2022"}$1.99 for the Ranger Or the Necromancer
        </Text>
      </View>
      <View>
        <Text style={styles["text-lg"]}>
          {"\u2022"}$0.99 for cloud saves - offsets server costs - free with a
          class purchase
        </Text>
      </View>
    </View>
  );
}
