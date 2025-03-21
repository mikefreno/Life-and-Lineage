import { type ReactNode } from "react";
import { ViewStyle, View } from "react-native";
import { normalize, useStyles } from "@/hooks/styles";
import { ThemedView } from "@/components/Themed";

interface ThemedCard {
  children?: ReactNode;
  style?: ViewStyle;
}
export default function ThemedCard({ children, style }: ThemedCard) {
  const styles = useStyles();

  return (
    <View style={{ margin: normalize(6), borderRadius: 12, ...style }}>
      <ThemedView style={styles.themedCard}>{children}</ThemedView>
    </View>
  );
}
