import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type GestureResponderEvent, Pressable } from "react-native";
import { useVibration } from "@/hooks/generic";
import { useScaling } from "@/hooks/scaling";
import { useRootStore } from "@/hooks/stores";

export default function AuthRoutesLayout() {
  const vibration = useVibration();
  const { uiStore } = useRootStore();
  return (
    <Tabs
      screenOptions={{
        tabBarIconStyle: { marginHorizontal: "auto" },
        tabBarStyle: { height: uiStore.tabHeight, paddingBottom: 16 },
        tabBarButton: (props) => {
          const onPressWithVibration = (event: GestureResponderEvent) => {
            vibration({ style: "light" });
            if (props.onPress) props.onPress(event);
          };
          return (
            <Pressable
              onPress={onPressWithVibration}
              style={{
                marginVertical: "auto",
                height: uiStore.iconSizeXL,
              }}
            >
              {props.children}
            </Pressable>
          );
        },
      }}
    >
      <Tabs.Screen
        name="sign-in"
        options={{
          headerShown: false,
          title: "Sign In",
          tabBarLabelStyle: { fontFamily: "PixelifySans" },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-circle"
              size={uiStore.iconSizeLarge}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sign-up"
        options={{
          headerShown: false,
          title: "Sign Up",
          tabBarLabelStyle: { fontFamily: "PixelifySans" },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-plus"
              size={uiStore.iconSizeLarge}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
