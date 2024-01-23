import { useColorScheme } from "nativewind";
import { Pressable, View, Text, ColorValue } from "react-native";

interface GenericRaisedButtonProps {
  onPressFunction: () => void;
  backgroundColor?: ColorValue;
  text: string;
  textColor?: ColorValue;
  disabledCondition?: boolean;
}

const GenericRaisedButton = ({
  onPressFunction,
  backgroundColor,
  textColor,
  text,
  disabledCondition = false,
}: GenericRaisedButtonProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <Pressable
      className="mx-auto mb-2 mt-4"
      onPress={onPressFunction}
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
            {text}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
export default GenericRaisedButton;
