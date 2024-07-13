import { PressableProps, type View } from "react-native";

export function tapRef(
  pressableRef:
    | React.RefObject<
        React.ForwardRefExoticComponent<
          PressableProps & React.RefAttributes<View>
        >
      >
    | undefined,
) {
  if (pressableRef && pressableRef.current) {
    (
      pressableRef.current as any
    )._internalFiberInstanceHandleDEV.memoizedProps.onClick(); //this is super jank (not part of public api)
  }
}
