import React from "react";
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
import { observer } from "mobx-react-lite";

const OptionsLayout = observer(() => {
  const vibration = useVibration();
  const styles = useStyles();
  const { uiStore } = useRootStore();
  const isLandscape = uiStore.isLandscape;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[uiStore.colorScheme].tint,

        tabBarLabel: (props) => (
          <RNText
            style={{
              fontFamily: "PixelifySans",
              ...styles["text-sm"],
              color: props.color,
              marginLeft: isLandscape ? 8 : 0,
              textAlign: isLandscape ? "left" : "center",
            }}
          >
            {props.children}
          </RNText>
        ),

        tabBarStyle: {
          borderTopWidth: 0,
          height: uiStore.tabHeight + 8,
          ...styles.diffuseTop,
          paddingHorizontal: isLandscape ? 16 : 0,
        },

        tabBarIconStyle: {
          width: uiStore.iconSizeXL,
          height: uiStore.iconSizeXL,
          marginRight: isLandscape ? 8 : 0,
        },

        animation:
          uiStore.reduceMotion || Platform.OS === "android" ? "none" : "shift",

        tabBarButton: (props) => {
          const onPressWithVibration = (e: GestureResponderEvent) => {
            vibration({ style: "light" });
            props.onPress?.(e);
          };

          return (
            <Pressable
              onPress={onPressWithVibration}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              style={[
                props.style,
                isLandscape
                  ? {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      height: uiStore.tabHeight + 8,
                      paddingHorizontal: 16,
                    }
                  : {
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
          tabBarIcon: ({ color }) => (
            <Foundation name="sound" color={color} size={uiStore.iconSizeXL} />
          ),
        }}
      />
      <Tabs.Screen
        name="Codex/index"
        options={{
          href: __DEV__ ? undefined : null,
          headerShown: false,
          title: "Codex",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="book-open-variant"
              color={color}
              size={uiStore.iconSizeXL}
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
        name="pvp"
        options={{
          href: __DEV__ ? undefined : null,
          headerShown: false,
          title: "PVP",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="sword-cross"
              size={uiStore.iconSizeXL}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="iaps"
        options={{
          headerShown: false,
          title: "IAPs",
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
});

export default OptionsLayout;
