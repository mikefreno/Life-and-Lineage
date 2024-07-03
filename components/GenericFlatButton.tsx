import { ReactNode } from "react";
import { ColorValue, Pressable, View } from "react-native";
import { Text } from "./Themed";

type GenericFlatButtonTextProps = {
  onPressFunction: () => void;
  text: string;
  disabledCondition?: boolean;
  backgroundColor?: ColorValue;
  className?: string;
};
type GenericFlatButtonNodeProps = {
  onPressFunction: () => void;
  textNode: ReactNode;
  disabledCondition?: boolean;
  backgroundColor?: ColorValue;
  className?: string;
};

type Props = GenericFlatButtonNodeProps | GenericFlatButtonTextProps;

const GenericFlatButton = ({
  onPressFunction,
  disabledCondition = false,
  backgroundColor,
  ...props
}: Props) => {
  return (
    <Pressable
      disabled={disabledCondition}
      onPress={onPressFunction}
      className={props.className}
    >
      {({ pressed }) => (
        <View
          className={`${pressed ? "scale-95 opacity-50" : ""} ${
            !disabledCondition
              ? "mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg dark:border-zinc-50"
              : "mx-auto rounded-xl border border-zinc-400 px-6 py-2 text-lg"
          }`}
          style={{ backgroundColor: backgroundColor }}
        >
          {"text" in props && props.text ? (
            <Text
              className="text-center text-xl tracking-widest"
              style={disabledCondition ? { color: "#d4d4d8" } : {}}
            >
              {props.text}
            </Text>
          ) : (
            "textNode" in props && props.textNode
          )}
        </View>
      )}
    </Pressable>
  );
};
export default GenericFlatButton;
