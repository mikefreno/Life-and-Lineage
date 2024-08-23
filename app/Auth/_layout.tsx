import { Tabs, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";

export default function AuthRoutesLayout() {
  const auth = useAuth();
  if (auth.isAuthenticated) {
    router.back();
  }
  return (
    <Tabs>
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
