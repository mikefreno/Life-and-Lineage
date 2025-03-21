import {
  View,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { Text } from "@/components/Themed";
import { ReactNode } from "react";
import { useStyles } from "@/hooks/styles";

interface GenericStrikeAround {
  containerStyles?: StyleProp<ViewStyle>;
  children: string | ReactNode;
  style?: TextStyle;
}

/**
 * Pass in a string to render as <Text style={...text.xl}>{children}</Text>
 * Or pass in a node
 */
export default function GenericStrikeAround({
  containerStyles,
  children,
  style,
}: GenericStrikeAround) {
  const styles = useStyles();

  return (
    <View style={[styles.rowItemsCenter, containerStyles]}>
      <View style={styles.strikeAroundLine} />
      <View style={styles.mx2}>
        {typeof children === "string" ? (
          <Text style={style || { fontSize: 20 }}>{children}</Text>
        ) : (
          children
        )}
      </View>
      <View style={styles.strikeAroundLine} />
    </View>
  );
}
