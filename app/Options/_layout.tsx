import { Tabs } from "expo-router";
import { Foundation, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  type GestureResponderEvent,
  Platform,
  Pressable,
  Text as RNText,
} from "react-native";
import { useVibration } from "@/hooks/generic";
import { useStyles } from "@/hooks/styles";
import { useRootStore } from "@/hooks/stores";
import Colors from "@/constants/Colors";

export default function OptionsLayout() {
  const vibration = useVibration();
  const styles = useStyles();
  const { uiStore } = useRootStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[uiStore.colorScheme].tint,
        tabBarLabel: (props) => {
          return (
            <RNText
              style={{
                textAlign: "center",
                fontFamily: "PixelifySans",
                ...styles["text-sm"],
                color: props.color,
                paddingTop: 2,
              }}
            >
              {props.children}
            </RNText>
          );
        },
        tabBarStyle: {
          borderTopWidth: 0,
          ...styles.diffuseTop,
        },
        tabBarIconStyle: {
          height: uiStore.iconSizeXL,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          paddingTop: 0,
        },
        animation:
          uiStore.reduceMotion || Platform.OS == "android" ? "none" : "shift",
        tabBarButton: (props) => {
          const onPressWithVibration = (event: GestureResponderEvent) => {
            vibration({ style: "light" });
            if (props.onPress) props.onPress(event);
          };
          return (
            <Pressable
              onPress={onPressWithVibration}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              style={[
                props.style,
                {
                  justifyContent: "space-evenly",
                  paddingHorizontal: "15%",
                },
              ]}
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
