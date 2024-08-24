import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function OptionsLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { height: 64, paddingBottom: 16 } }}>
      <Tabs.Screen
        name="app"
        options={{
          headerShown: false,
          title: "App Settings",
          tabBarLabelStyle: { fontFamily: "PixelifySans" },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="application-brackets"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          headerShown: false,
          title: "Game Settings",
          tabBarLabelStyle: { fontFamily: "PixelifySans" },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="gamepad-circle-right"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Codex/index"
        options={{
          headerShown: false,
          title: "Codex",
          tabBarLabelStyle: { fontFamily: "PixelifySans" },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="book-open-variant"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Codex/[...slug]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
