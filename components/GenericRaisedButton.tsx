import { useColorScheme } from "nativewind";
import { Pressable, View, ColorValue } from "react-native";
import { Text } from "./Themed";
import type { ReactNode } from "react";
import { useVibration } from "../hooks/generic";

interface GenericRaisedButtonProps {
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  backgroundColor?: ColorValue;
  children: string | ReactNode;
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
  style?: {};
}

const GenericRaisedButton = ({
  onPress,
  onPressIn,
  onPressOut,
  backgroundColor,
  textColor,
  children,
  disabled = false,
  vibrationStrength = "light",
  vibrationEssentiality = false,
  disableTopLevelStyling = false,
  style,
}: GenericRaisedButtonProps) => {
  const { colorScheme } = useColorScheme();

  const vibration = useVibration();

  return (
    <Pressable
      className={!disableTopLevelStyling ? "mx-auto mb-2 mt-4" : undefined}
      onPress={() => {
        vibration({
          style: vibrationStrength,
          essential: vibrationEssentiality,
        });
        if (onPress) {
          onPress();
        }
      }}
      onPressIn={() => {
        vibration({
          style: vibrationStrength,
          essential: vibrationEssentiality,
        });
        if (onPressIn) {
          onPressIn();
        }
      }}
      onPressOut={() => {
        if (onPressOut) {
          onPressOut();
        }
      }}
      disabled={disabled}
      style={style}
    >
      {({ pressed }) => (
        <View
          className={`rounded-xl px-8 py-4 ${
            pressed ? "scale-95 opacity-50" : ""
          }`}
          style={
            !disabled
              ? {
                  shadowColor: colorScheme == "light" ? "black" : "white",
                  elevation: 2,
                  backgroundColor: backgroundColor
                    ? backgroundColor
                    : colorScheme == "light"
                    ? "white"
                    : "#71717a",
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                }
              : {
                  backgroundColor: backgroundColor
                    ? backgroundColor
                    : colorScheme == "light"
                    ? "white"
                    : "#3f3f46",
                  opacity: 0.5,
                }
          }
        >
          {typeof children === "string" ? (
            <Text
              className="text-center"
              style={{
                color: textColor
                  ? textColor
                  : colorScheme == "light"
                  ? "#27272a"
                  : "#fafafa",
              }}
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
export default GenericRaisedButton;
