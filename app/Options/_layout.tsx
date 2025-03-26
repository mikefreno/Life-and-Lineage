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
import { Text } from "@/components/Themed";

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
          marginHorizontal: "auto",
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
          tabBarIconStyle: {
            width: uiStore.iconSizeXL,
            height: uiStore.iconSizeXL,
            marginRight: uiStore.isLandscape ? 16 : 0,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="application-brackets"
              color={color}
              size={uiStore.iconSizeXL}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          headerShown: false,
          title: "Game",
          tabBarIconStyle: {
            width: uiStore.iconSizeXL,
            height: uiStore.iconSizeXL,
            marginRight: uiStore.isLandscape ? 16 : 0,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="gamepad-circle-right"
              color={color}
              size={uiStore.iconSizeXL}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="audio"
        options={{
          headerShown: false,
          title: "Audio",
          tabBarIconStyle: {
            width: uiStore.iconSizeXL,
            height: uiStore.iconSizeXL,
            marginRight: uiStore.isLandscape ? 16 : 0,
          },
          tabBarIcon: ({ color }) => (
            <Foundation name="sound" color={color} size={uiStore.iconSizeXL} />
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
            <MaterialCommunityIcons name="book-open-variant" color={color} />
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
          headerShown: false,
          title: "IAPs",
          tabBarIconStyle: {
            width: uiStore.iconSizeXL,
            height: uiStore.iconSizeXL,
            marginRight: uiStore.isLandscape ? 16 : 0,
          },
          tabBarIcon: ({ color }) => (
            <Text
              style={{
                color,
                fontSize: uiStore.iconSizeXL,
                lineHeight: uiStore.iconSizeXL,
              }}
            >
              $
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
