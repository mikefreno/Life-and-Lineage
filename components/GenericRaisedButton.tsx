import { useColorScheme } from "nativewind";
import { Pressable, View, ColorValue } from "react-native";
import { useVibration } from "../utility/customHooks";
import { Text } from "./Themed";

interface GenericRaisedButtonProps {
  onPressFunction: () => void;
  backgroundColor?: ColorValue;
  children: string;
  textColor?: ColorValue;
  disabledCondition?: boolean;
  vibrationStrength?:
    | "light"
    | "medium"
    | "heavy"
    | "success"
    | "warning"
    | "error";
  vibrationEssentiality?: boolean;
  disableTopLevelStyling?: boolean;
}

const GenericRaisedButton = ({
  onPressFunction,
  backgroundColor,
  textColor,
  children,
  disabledCondition = false,
  vibrationStrength = "light",
  vibrationEssentiality = false,
  disableTopLevelStyling = false,
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
        onPressFunction();
      }}
      disabled={disabledCondition}
    >
      {({ pressed }) => (
        <View
          className={`rounded-xl px-8 py-4 ${
            pressed ? "scale-95 opacity-50" : ""
          }`}
          style={
            !disabledCondition
              ? {
                  shadowColor: "#000",
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
        </View>
      )}
    </Pressable>
  );
};
export default GenericRaisedButton;
