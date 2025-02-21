import React from "react";
import {
  StyleSheet,
  ColorValue,
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
import { useVibration } from "../hooks/generic";
import { Text } from "./Themed";
import { useRootStore } from "../hooks/stores";

interface GenericRaisedButtonProps {
  ref?: React.RefObject<any>;
  onPress?: () => void;
  onPressIn?: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
  backgroundColor?: ColorValue;
  children: string | React.ReactNode;
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
}

const styles = StyleSheet.create({
  defaultContainer: {
    marginHorizontal: "auto",
    marginBottom: 8,
    marginTop: 16,
  },
  buttonContainer: {
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  centerText: {
    textAlign: "center",
  },
});

const GenericRaisedButton = ({
  ref,
  onPress,
  onPressIn,
  onLongPress,
  onPressOut,
  backgroundColor,
  textColor,
  children,
  disabled = false,
  vibrationStrength = "light",
  vibrationEssentiality = false,
  disableTopLevelStyling = false,
  style,
  buttonStyle,
}: GenericRaisedButtonProps) => {
  const vibration = useVibration();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const { uiStore } = useRootStore();

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
    const baseStyles = !disableTopLevelStyling ? styles.defaultContainer : {};
    return [baseStyles, style];
  }, [disableTopLevelStyling, style]);

  const dynamicButtonStyle = React.useMemo(() => {
    if (!disabled) {
      return {
        shadowColor: uiStore.colorScheme === "light" ? "black" : "white",
        elevation: 2,
        backgroundColor:
          backgroundColor ||
          (uiStore.colorScheme === "light" ? "white" : "#71717a"),
        shadowOpacity: 0.1,
        shadowRadius: 5,
      };
    }
    return {
      backgroundColor:
        backgroundColor ||
        (uiStore.colorScheme === "light" ? "#fafafa" : "#3f3f46"),
      opacity: 0.5,
    };
  }, [uiStore.colorScheme, disabled, backgroundColor]);

  const textStyle = React.useMemo(
    () => ({
      color:
        textColor || (uiStore.colorScheme === "light" ? "#27272a" : "#fafafa"),
      opacity: disabled ? 0.5 : 1,
    }),
    [uiStore.colorScheme, textColor, disabled],
  );

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
          styles.buttonContainer,
          buttonStyle,
          dynamicButtonStyle,
          animatedStyle,
        ]}
      >
        {typeof children === "string" ? (
          <Text style={[styles.centerText, textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </Animated.View>
    </Pressable>
  );
};

export default GenericRaisedButton;
