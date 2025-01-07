import { type ReactNode } from "react";
import { ViewStyle, View } from "react-native";
import { useStyles } from "../hooks/styles";
import { ThemedView } from "./Themed";

interface ThemedCard {
  children?: ReactNode;
  style?: ViewStyle;
}
export default function ThemedCard({ children, style }: ThemedCard) {
  const styles = useStyles();

  return (
    <View style={{ margin: 8, borderRadius: 12, ...style }}>
      <ThemedView style={styles.themedCard}>{children}</ThemedView>
    </View>
  );
}
