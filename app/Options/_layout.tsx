import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type GestureResponderEvent, Pressable, View } from "react-native";
import { useVibration } from "../../utility/customHooks";

export default function OptionsLayout() {
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
            <View className="flex flex-col w-1/3">
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
      <Tabs.Screen
        name="iaps"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
