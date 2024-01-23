import { ReactNode } from "react";
import { Pressable, View, Text } from "react-native";

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
    <Pressable onPress={onPressFunction}>
      {({ pressed }) => (
        <View
          className={`${
            pressed ? "scale-95 opacity-50" : ""
          } mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg dark:border-zinc-50`}
        >
          {text ? (
            <Text className="text-xl tracking-widest">{text}</Text>
          ) : (
            textNode
          )}
        </View>
      )}
    </Pressable>
  );
};
export default GenericFlatButton;
