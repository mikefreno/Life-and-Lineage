import { View, StyleSheet } from "react-native";
import { Text } from "./Themed";
import { ReactNode } from "react";

interface GenericStrikeAroundBasicProps {
  text: string;
  textNode?: never;
}

interface GenericStrikeAroundNodeProps {
  textNode: ReactNode;
  text?: never;
}

type Props = GenericStrikeAroundBasicProps | GenericStrikeAroundNodeProps;

export default function GenericStrikeAround({ text, textNode }: Props) {
  return (
    <View style={styles.container}>
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
