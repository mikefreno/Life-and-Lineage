import { ReactNode } from "react";
import {
  type AccessibilityRole,
  ColorValue,
  Pressable,
  View,
  type ViewStyle,
} from "react-native";
import { Text } from "./Themed";
import { useStyles } from "../hooks/styles";
import { useRootStore } from "../hooks/stores";

type GenericFlatButton = {
  onPress: () => void;
  disabled?: boolean;
  backgroundColor?: ColorValue;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  children: string | ReactNode;
  textColor?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | "mixed";
    busy?: boolean;
    expanded?: boolean;
  };
};

const GenericFlatButton = ({
  onPress,
  disabled = false,
  backgroundColor,
  textColor,
  children,
  style,
  innerStyle,
  ...props
}: GenericFlatButton) => {
  const styles = useStyles();
  const { uiStore } = useRootStore();
  return (
    <Pressable disabled={disabled} onPress={onPress} style={style} {...props}>
      {({ pressed }) => (
        <View
          style={[
            styles.flatButtonContainer,
            {
              borderColor: disabled
                ? "#a1a1aa"
                : uiStore.colorScheme === "dark"
                ? "#fafafa"
                : "#18181b",
              backgroundColor,
              transform: [{ scale: pressed ? 0.95 : 1 }],
              opacity: pressed ? 0.5 : 1,
              ...innerStyle,
            },
          ]}
        >
          {typeof children === "string" ? (
            <Text
              style={[
                styles.flatButtonText,
                disabled
                  ? { color: "#d4d4d8" }
                  : textColor
                  ? { color: textColor }
                  : {},
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </Pressable>
  );
};

export default GenericFlatButton;
