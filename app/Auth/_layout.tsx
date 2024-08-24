import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AuthRoutesLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { height: 64, paddingBottom: 16 } }}>
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
