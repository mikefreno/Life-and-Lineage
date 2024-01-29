import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./Themed";

interface GenericFlatButtonTextProps {
  onPressFunction: () => void;
  text: string;
  disabledCondition?: boolean;
  textNode?: never;
}
interface GenericFlatButtonNodeProps {
  onPressFunction: () => void;
  text?: never;
  disabledCondition?: boolean;
  textNode: ReactNode;
}

type Props = GenericFlatButtonNodeProps | GenericFlatButtonTextProps;

const GenericFlatButton = ({
  onPressFunction,
  text,
  textNode,
  disabledCondition = false,
}: Props) => {
  return (
    <Pressable disabled={disabledCondition} onPress={onPressFunction}>
      {({ pressed }) => (
        <View
          className={`${pressed ? "scale-95 opacity-50" : ""} ${
            !disabledCondition
              ? "mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg dark:border-zinc-50"
              : "mx-auto rounded-xl border border-zinc-400 px-6 py-2 text-lg"
          }`}
        >
          {text ? (
            <Text
              className="text-center text-xl tracking-widest"
              style={disabledCondition ? { color: "#d4d4d8" } : {}}
            >
              {text}
            </Text>
          ) : (
            textNode
          )}
        </View>
      )}
    </Pressable>
  );
};
export default GenericFlatButton;
