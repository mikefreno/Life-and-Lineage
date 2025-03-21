import { ReactNode, useEffect, useRef, useState } from "react";
import {
  type AccessibilityRole,
  Animated,
  type ColorValue,
  Pressable,
  View,
  type ViewStyle,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Text } from "@/components/Themed";
import { useStyles } from "@/hooks/styles";
import { useRootStore } from "@/hooks/stores";
import React from "react";
import AnimatedButtonText from "@/components/AnimatedButtonText";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type GenericFlatButton = {
  onPress: () => void;
  disabled?: boolean;
  backgroundColor?: ColorValue;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  children: string | ReactNode;
  childrenWhenDisabled?: string | ReactNode;
  disabledAddendum?: string;
  textColor?: ColorValue;
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
  childrenWhenDisabled,
  disabledAddendum,
  backgroundColor,
  textColor,
  children,
  style,
  innerStyle,
  ...props
}: GenericFlatButton) => {
  const styles = useStyles();
  const { uiStore } = useRootStore();
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);
  const [textWidth, setTextWidth] = useState<number | null>(null);
  const [prevDisabled, setPrevDisabled] = useState(disabled);
  const buttonWidthAnim = useRef(new Animated.Value(0)).current;

  const currentText =
    typeof children === "string"
      ? childrenWhenDisabled && disabled
        ? (childrenWhenDisabled as string)
        : children
      : "";

  const onTextLayout = (e: any) => {
    const { width } = e.nativeEvent.layout;
    if (width !== textWidth) {
      setTextWidth(width);
    }
  };

  const onButtonLayout = (e: any) => {
    const { width } = e.nativeEvent.layout;
    if (buttonWidth === null) {
      setButtonWidth(width);
      buttonWidthAnim.setValue(width);
    }
  };

  useEffect(() => {
    if (disabled !== prevDisabled && buttonWidth && textWidth) {
      LayoutAnimation.configureNext({
        duration: 200,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });

      setPrevDisabled(disabled);
    }
  }, [disabled, buttonWidth, textWidth, prevDisabled]);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={style} {...props}>
      {({ pressed }) => (
        <View
          onLayout={onButtonLayout}
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
            <>
              <AnimatedButtonText
                currentText={currentText}
                disabled={disabled}
                textColor={textColor}
                styles={styles}
                onLayout={onTextLayout}
              />
              {disabled && disabledAddendum && (
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
                  {disabledAddendum}
                </Text>
              )}
            </>
          ) : (
            children
          )}
        </View>
      )}
    </Pressable>
  );
};

export default GenericFlatButton;
