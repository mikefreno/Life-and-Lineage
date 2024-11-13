import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type GestureResponderEvent, Pressable, View } from "react-native";
import { useVibration } from "../../hooks/generic";

export default function AuthRoutesLayout() {
  const vibration = useVibration();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { height: 64, paddingBottom: 16 },
        tabBarButton: (props) => {
          const onPressWithVibration = (event: GestureResponderEvent) => {
            vibration({ style: "light" });
            if (props.onPress) props.onPress(event);
          };
          return (
            <View className="flex flex-col w-1/2">
              <Pressable
                onPress={onPressWithVibration}
                style={{
                  height: 44,
                }}
              >
                {props.children}
              </Pressable>
            </View>
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
              size={24}
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
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
