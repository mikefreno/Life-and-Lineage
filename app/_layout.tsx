import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router, usePathname } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import { Platform, StyleSheet } from "react-native";
import { ThemedView } from "../components/Themed";
import "../assets/styles/globals.css";
import { BlurView } from "expo-blur";
import * as Sentry from "@sentry/react-native";
import D20DieAnimation from "../components/DieRollAnim";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { toTitleCase, wait } from "../utility/functions/misc";
import { API_BASE_URL } from "../config/config";
import { SystemBars } from "react-native-edge-to-edge";
import { DarkTheme, LightTheme } from "../constants/Colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../stores/auth/Auth";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../utility/functions/notifications";
import { AppProvider, useGameState, useLayout } from "../stores/AppData";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on ﻿/modal keeps a back button present.
  initialRouteName: "(tabs)",
};
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: "https://2cff54f8aeb50bcb7151c159cc40fe1b@o4506630160187392.ingest.sentry.io/4506630163398656",
  debug: false, //__DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

/**
 * This wraps the entire app, loads the player data, sets up user app settings and holds&sets the `AppContext`.
 * The responsibility of this is largely around unseen app state, whereas `RootLayout` is largely concerned with UI
 */
const Root = observer(() => {
  return (
    <AuthProvider>
      <AppProvider>
        <SafeAreaProvider>
          <RootLayout />
        </SafeAreaProvider>
      </AppProvider>
    </AuthProvider>
  );
});

/**
 * This focuses on getting the UI set, and relieving the splash screen when ready
 */
const RootLayout = observer(() => {
  const [fontLoaded] = useFonts({
    PixelifySans: require("../assets/fonts/PixelifySans-Regular.ttf"),
    Handwritten: require("../assets/fonts/Caveat-VariableFont_wght.ttf"),
    Cursive: require("../assets/fonts/Tangerine-Regular.ttf"),
    CursiveBold: require("../assets/fonts/Tangerine-Bold.ttf"),
  });
  const { playerState, gameState, appDataLoading } = useGameState();
  const { modalShowing } = useLayout();
  const { colorScheme } = useColorScheme();
  const [firstLoad, setFirstLoad] = useState(true);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [sentToken, setSentToken] = useState(false);
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const pathname = usePathname();

  useEffect(() => {
    if (fontLoaded) {
      wait(500).then(() => {
        registerForPushNotificationsAsync()
          .then((token) => setExpoPushToken(token ?? ""))
          .catch((error: any) => setExpoPushToken(`${error}`));

        notificationListener.current =
          Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
          });

        responseListener.current =
          Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(response);
          });

        return () => {
          notificationListener.current &&
            Notifications.removeNotificationSubscription(
              notificationListener.current,
            );
          responseListener.current &&
            Notifications.removeNotificationSubscription(
              responseListener.current,
            );
        };
      });
    }
  }, [fontLoaded]);

  useEffect(() => {
    if (expoPushToken && !sentToken) {
      fetch(`${API_BASE_URL}/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: expoPushToken }),
      });
      setSentToken(true);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (fontLoaded && !appDataLoading) {
      SplashScreen.hideAsync();
      if (!playerState) {
        router.replace("/NewGame");
      } else if (
        gameState?.atDeathScreen ||
        (playerState &&
          (playerState.currentHealth <= 0 || playerState.currentSanity <= -50))
      ) {
        if (pathname !== "/DeathScreen")
          wait(modalShowing ? 600 : 0).then(() => {
            while (router.canGoBack()) {
              router.back();
            }
            router.replace("/DeathScreen");
          });
      } else if (playerState.currentDungeon && firstLoad) {
        while (router.canGoBack()) {
          router.back();
        }
        router.replace(
          `/DungeonLevel/${playerState.currentDungeon
            ?.instance}/${playerState.currentDungeon?.level
            .toString()
            .replace(",", "/")}`,
        );
      }
      setFirstLoad(false);
    }
  }, [fontLoaded, playerState?.currentHealth, playerState?.currentSanity]);

  while (!fontLoaded) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <D20DieAnimation keepRolling={!fontLoaded} />
      </ThemedView>
    );
  }

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : LightTheme}>
        <SystemBars style="auto" />
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              autoHideHomeIndicator: true,
            }}
          />
          <Stack.Screen
            name="Options"
            options={headerOptions({ presentation: "modal" })}
          />
          <Stack.Screen
            name="Auth"
            options={headerOptions({ presentation: "modal" })}
          />
          <Stack.Screen
            name="Relationships"
            options={headerOptions({
              colorScheme,
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="Study"
            options={headerOptions({
              title: "Magic Study",
              colorScheme,
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="Education"
            options={headerOptions({
              colorScheme,
              blur: true,
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="Activities"
            options={headerOptions({
              colorScheme,
              blur: true,
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="Investing"
            options={headerOptions({
              colorScheme,
              blur: true,
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="Shops/[shop]"
            options={headerOptions({
              colorScheme,
              blur: true,
              title: toTitleCase(
                (pathname.split("/")[2] ?? "").replaceAll("%20", " "),
              ),
            })}
          />
          <Stack.Screen
            name="NewGame/index"
            options={headerOptions({
              title: "Class Select",
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="NewGame/SetBlessing/[slug]"
            options={headerOptions({ title: "Blessing Select" })}
          />
          <Stack.Screen
            name="NewGame/SetSex/[...slug]"
            options={headerOptions({ title: "Sex Select" })}
          />
          <Stack.Screen
            name="NewGame/SetName/[...slug]"
            options={headerOptions({ title: "Name Set" })}
          />
          <Stack.Screen
            name="NewGame/Review/[...slug]"
            options={headerOptions({ title: "Review" })}
          />
          <Stack.Screen
            name="DeathScreen"
            options={{
              ...headerOptions({ title: "You Died" }),
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
});
export default Sentry.wrap(Root);

const headerOptions = ({
  colorScheme,
  blur,
  title,
  presentation,
  headerBackTitleVisible = true,
}: {
  colorScheme?: "light" | "dark";
  presentation?:
    | "modal"
    | "transparentModal"
    | "containedModal"
    | "containedTransparentModal"
    | "fullScreenModal"
    | "formSheet"
    | "card";
  blur?: boolean;
  title?: string;
  headerBackTitleVisible?: boolean;
}) =>
  blur
    ? {
        title: title,
        headerBackTitleVisible: false,
        headerTransparent: true,
        headerTitleStyle: {
          fontFamily: "PixelifySans",
          fontSize: 22,
        },
        headerBackground: () => (
          <BlurView
            blurReductionFactor={12}
            tint={
              Platform.OS == "android"
                ? colorScheme == "light"
                  ? "light"
                  : "dark"
                : "default"
            }
            intensity={100}
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod={"dimezisBlurView"}
          />
        ),
      }
    : {
        title: title,
        headerBackTitleVisible: headerBackTitleVisible,
        presentation: presentation,
        headerTitleStyle: {
          fontFamily: "PixelifySans",
          fontSize: 22,
        },
      };
