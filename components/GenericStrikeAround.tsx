import {
  View,
  StyleSheet,
  ViewProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Text } from "./Themed";
import { ReactNode } from "react";

interface GenericStrikeAroundBasicProps {
  containerStyles?: StyleProp<ViewStyle>;
  text: string;
  textNode?: never;
}

interface GenericStrikeAroundNodeProps {
  containerStyles?: StyleProp<ViewStyle>;
  textNode: ReactNode;
  text?: never;
}

type Props = GenericStrikeAroundBasicProps | GenericStrikeAroundNodeProps;

export default function GenericStrikeAround({
  text,
  textNode,
  containerStyles,
}: Props) {
  return (
    <View style={[styles.container, containerStyles]}>
      <View style={styles.line} />
      <View style={styles.content}>
        {text ? <Text className="text-xl">{text}</Text> : textNode}
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
