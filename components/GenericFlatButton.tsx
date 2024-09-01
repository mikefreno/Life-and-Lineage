import { ReactNode } from "react";
import { ColorValue, Pressable, View } from "react-native";
import { Text } from "./Themed";

type GenericFlatButton = {
  onPressFunction: () => void;
  disabledCondition?: boolean;
  backgroundColor?: ColorValue;
  className?: string;
  children: string | ReactNode;
  textColor?: string;
};

const GenericFlatButton = ({
  onPressFunction,
  disabledCondition = false,
  backgroundColor,
  textColor,
  children,
  className,
}: GenericFlatButton) => {
  return (
    <Pressable
      disabled={disabledCondition}
      onPress={onPressFunction}
      className={className}
    >
      {({ pressed }) => (
        <View
          className={`${pressed ? "scale-95 opacity-50" : ""} ${
            !disabledCondition
              ? "mx-auto rounded-xl border border-zinc-900 px-6 py-2 dark:border-zinc-50"
              : "mx-auto rounded-xl border border-zinc-400 px-6 py-2"
          }`}
          style={{ backgroundColor: backgroundColor }}
        >
          {typeof children === "string" ? (
            <Text
              className="text-center tracking-widest"
              style={
                disabledCondition
                  ? { color: "#d4d4d8" }
                  : textColor
                  ? { color: textColor }
                  : {}
              }
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
