import React, { useMemo, useState } from "react";
import {
  ColorValue,
  DimensionValue,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import AnimatedButtonText from "@/components/AnimatedButtonText";
import { Text } from "@/components/Themed";
import { useStyles } from "@/hooks/styles";
import { useScaling } from "@/hooks/scaling";

interface GenericRaisedButtonProps {
  ref?: React.RefObject<any>;
  onPress?: () => void;
  onPressIn?: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
  backgroundColor?: ColorValue;
  children: string | React.ReactNode;
  childrenWhenDisabled?: string | React.ReactNode;
  disabledAddendum?: string;
  textColor?: ColorValue;
  disabled?: boolean;
  vibrationStrength?:
    | "light"
    | "medium"
    | "heavy"
    | "success"
    | "warning"
    | "error";
  vibrationEssentiality?: boolean;
  disableTopLevelStyling?: boolean;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  height?: DimensionValue;
  textSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

const GenericRaisedButton = ({
  ref,
  onPress,
  onPressIn,
  onLongPress,
  onPressOut,
  backgroundColor,
  textColor,
  children,
  childrenWhenDisabled,
  disabledAddendum,
  disabled = false,
  vibrationStrength = "light",
  vibrationEssentiality = false,
  disableTopLevelStyling = false,
  textSize,
  style,
  buttonStyle,
  height,
}: GenericRaisedButtonProps) => {
  const vibration = useVibration();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const { uiStore } = useRootStore();
  const [textWidth, setTextWidth] = useState<number | null>(null);
  const styles = useStyles();
  const { getNormalizedSize } = useScaling();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 50 });
    opacity.value = withTiming(0.5, { duration: 50 });
    vibration({
      style: vibrationStrength,
      essential: vibrationEssentiality,
    });
    onPressIn?.();
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 50 });
    opacity.value = withTiming(1, { duration: 50 });
    onPressOut?.();
  };

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50, easing: Easing.ease }),
      withTiming(1, { duration: 50, easing: Easing.ease }),
    );
    opacity.value = withSequence(
      withTiming(0.5, { duration: 50, easing: Easing.ease }),
      withTiming(1, { duration: 50, easing: Easing.ease }),
    );
    vibration({
      style: vibrationStrength,
      essential: vibrationEssentiality,
    });
    onPress?.();
  };

  const containerStyle = React.useMemo(() => {
    const baseStyles = !disableTopLevelStyling
      ? ({
          marginHorizontal: "auto",
          paddingBottom: 8,
          paddingTop: 16,
          height: height, // Apply height constraint to container if provided
          justifyContent: height ? "center" : undefined, // Center content vertically if height is provided
        } as const)
      : height
      ? ({ height, justifyContent: "center" } as const)
      : {};
    return [baseStyles, style];
  }, [disableTopLevelStyling, style, height]);

  const dynamicButtonStyle = useMemo(() => {
    const baseStyle = {
      shadowColor: uiStore.colorScheme === "light" ? "black" : "white",
      elevation: 2,
      backgroundColor:
        backgroundColor ||
        (uiStore.colorScheme === "light" ? "white" : "#71717a"),
      shadowOpacity: 0.1,
      shadowRadius: 5,
      height: height ? "100%" : undefined,
      justifyContent: "center",
      alignItems: "center",
    } as const;

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor:
          backgroundColor ||
          (uiStore.colorScheme === "light" ? "#fafafa" : "#3f3f46"),
        opacity: 0.5,
        elevation: 0,
        shadowOpacity: 0,
      } as const;
    }

    return baseStyle;
  }, [uiStore.colorScheme, disabled, backgroundColor, height]);

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

  return (
    <Pressable
      ref={ref}
      style={containerStyle}
      onPress={handlePress}
      onLongPress={() => {
        vibration({
          style: vibrationStrength,
          essential: vibrationEssentiality,
        });
        onLongPress?.();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          {
            borderRadius: 12,
            paddingHorizontal: getNormalizedSize(20),
            paddingVertical: getNormalizedSize(12),
            flexDirection: "row", // Ensure text components are in a row
            justifyContent: "center", // Center content horizontally
            alignItems: "center", // Center content vertically
          },
          buttonStyle,
          dynamicButtonStyle,
          animatedStyle,
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
              textSize={textSize}
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
      </Animated.View>
    </Pressable>
  );
};

export default GenericRaisedButton;
