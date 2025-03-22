import { type ReactNode } from "react";
import { ViewStyle, View } from "react-native";
import { useStyles } from "@/hooks/styles";
import { ThemedView } from "@/components/Themed";
import { useScaling } from "@/hooks/scaling";

interface ThemedCard {
  children?: ReactNode;
  style?: ViewStyle;
}
export default function ThemedCard({ children, style }: ThemedCard) {
  const styles = useStyles();
  const { getNormalizedSize } = useScaling();

  return (
    <View style={{ margin: getNormalizedSize(6), borderRadius: 12, ...style }}>
      <ThemedView style={styles.themedCard}>{children}</ThemedView>
    </View>
  );
}
