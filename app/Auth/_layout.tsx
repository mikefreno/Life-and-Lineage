import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type GestureResponderEvent, Pressable } from "react-native";
import { useVibration } from "@/hooks/generic";
import { normalize } from "@/hooks/styles";

export default function AuthRoutesLayout() {
  const vibration = useVibration();
  return (
    <Tabs
      screenOptions={{
        tabBarIconStyle: { marginHorizontal: "auto" },
        tabBarStyle: { height: normalize(80), paddingBottom: 16 },
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
                height: normalize(44),
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
              size={normalize(24)}
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
              size={normalize(24)}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
