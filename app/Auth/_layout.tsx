import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  type GestureResponderEvent,
  Platform,
  Pressable,
  Text as RNText,
} from "react-native";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import Colors from "@/constants/Colors";
import { observer } from "mobx-react-lite";

const AuthRoutesLayout = observer(() => {
  const vibration = useVibration();
  const { uiStore } = useRootStore();
  const styles = useStyles();
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
                  justifyContent: "center",
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
        name="sign-in"
        options={{
          headerShown: false,
          title: "Sign In",
          tabBarIconStyle: {
            width: uiStore.iconSizeXL,
            height: uiStore.iconSizeXL,
            marginRight: uiStore.isLandscape ? 16 : 0,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account"
              color={color}
              size={uiStore.iconSizeXL}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sign-up"
        options={{
          headerShown: false,
          title: "Sign Up",
          tabBarIconStyle: {
            width: uiStore.iconSizeXL,
            height: uiStore.iconSizeXL,
            marginRight: uiStore.isLandscape ? 16 : 0,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-plus"
              color={color}
              size={uiStore.iconSizeXL}
            />
          ),
        }}
      />
    </Tabs>
  );
});
export default AuthRoutesLayout;
