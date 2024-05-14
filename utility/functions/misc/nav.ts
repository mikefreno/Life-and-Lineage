import { CommonActions, NavigationProp } from "@react-navigation/native";

export default function clearHistory(
  navigation: NavigationProp<ReactNavigation.RootParamList>,
) {
  navigation.dispatch(
    CommonActions.reset({
      routes: [{ key: "(tabs)", name: "(tabs)" }],
    }),
  );
}
