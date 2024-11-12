import { ReactNode } from "react";
import { ColorValue, Pressable, View } from "react-native";
import { Text } from "./Themed";

type GenericFlatButton = {
  onPress: () => void;
  disabled?: boolean;
  backgroundColor?: ColorValue;
  className?: string;
  children: string | ReactNode;
  textColor?: string;
};

const GenericFlatButton = ({
  onPress,
  disabled = false,
  backgroundColor,
  textColor,
  children,
  className,
}: GenericFlatButton) => {
  return (
    <Pressable disabled={disabled} onPress={onPress} className={className}>
      {({ pressed }) => (
        <View
          className={`${pressed ? "scale-95 opacity-50" : ""} ${
            !disabled
              ? "mx-auto rounded-xl border border-zinc-900 px-6 py-2 dark:border-zinc-50"
              : "mx-auto rounded-xl border border-zinc-400 px-6 py-2"
          }`}
          style={{ backgroundColor: backgroundColor }}
        >
          {typeof children === "string" ? (
            <Text
              className="text-center tracking-widest"
              style={
                disabled
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
