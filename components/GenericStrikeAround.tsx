import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Text } from "./Themed";
import { ReactNode } from "react";

interface GenericStrikeAround {
  containerStyles?: StyleProp<ViewStyle>;
  children: string | ReactNode;
}

/**
 * Pass in a string to render as <Text className="text-xl">{children}</Text>
 * Or pass in a node
 */
export default function GenericStrikeAround({
  containerStyles,
  children,
}: GenericStrikeAround) {
  return (
    <View style={[styles.container, containerStyles]}>
      <View style={styles.line} />
      <View style={styles.content}>
        {typeof children === "string" ? (
          <Text className="text-xl">{children}</Text>
        ) : (
          children
        )}
      </View>
      <View style={styles.line} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
