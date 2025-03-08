import { Tabs } from "expo-router";
import { Foundation, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  type GestureResponderEvent,
  Pressable,
  Text as RNText,
} from "react-native";
import { useVibration } from "../../hooks/generic";
import { normalize, useStyles } from "@/hooks/styles";
import { useRootStore } from "@/hooks/stores";

export default function OptionsLayout() {
  const vibration = useVibration();
  const styles = useStyles();
  const { uiStore } = useRootStore();

  return (
    <Tabs
      screenOptions={{
        tabBarIconStyle: { alignSelf: "center" },
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          borderTopWidth: 0,
          alignContent: "center",
          ...styles.diffuseTop,
        },
        animation: uiStore.reduceMotion ? "fade" : "shift",
        tabBarLabel: (props) => {
          return (
            <RNText
              style={{
                textAlign: "center",
                fontFamily: "PixelifySans",
                ...styles["text-sm"],
                color: props.color,
                marginTop: normalize(3),
              }}
            >
              {props.children}
            </RNText>
          );
        },
        tabBarButton: (props) => {
          const onPressWithVibration = (event: GestureResponderEvent) => {
            vibration({ style: "light" });
            if (props.onPress) props.onPress(event);
          };
          return (
            <Pressable
              onPress={onPressWithVibration}
              style={{
                alignContent: "center",
                marginVertical: "auto",
                height: 44,
              }}
            >
              {props.children}
            </Pressable>
          );
        },
      }}
    >
      <Tabs.Screen
        name="app"
        options={{
          headerShown: false,
          title: "App",
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
          title: "Game",
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
        name="audio"
        options={{
          headerShown: false,
          title: "Audio",
          tabBarLabelStyle: { fontFamily: "PixelifySans" },
          tabBarIcon: ({ color }) => (
            <Foundation name="sound" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Codex/index"
        options={{
          href: null,
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
