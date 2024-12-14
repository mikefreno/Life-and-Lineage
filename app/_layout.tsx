import { useFonts } from "expo-font";
import { Stack, router, usePathname } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme as useNativeColor,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { ThemedView, Text } from "../components/Themed";
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
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../utility/functions/notifications";
import { useRootStore } from "../hooks/stores";
import { ProjectedImage } from "../components/Draggable";
import { AppProvider } from "../providers/AppData";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeProvider } from "@react-navigation/native";
import FleeModal from "../components/DungeonComponents/FleeModal";
import { DungeonProvider } from "../providers/DungeonData";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LoadingBoundary } from "../components/LoadingBoundary";
import { Character, PlayerCharacter } from "../entities/character";
import { RootStore } from "../stores/RootStore";
import { DungeonStore } from "../stores/DungeonStore";
import GenericModal from "../components/GenericModal";
import { CharacterImage } from "../components/CharacterImage";
import GenericFlatButton from "../components/GenericFlatButton";

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
SplashScreen.setOptions({
  fade: Platform.OS === "ios",
});

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
    <AppProvider>
      <DungeonProvider>
        <SafeAreaProvider>
          <ErrorBoundary>
            <LoadingBoundary>
              <RootLayout />
            </LoadingBoundary>
          </ErrorBoundary>
        </SafeAreaProvider>
      </DungeonProvider>
    </AppProvider>
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
  const rootStore = useRootStore();
  const { playerState, dungeonStore, uiStore } = rootStore;

  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColor = useNativeColor();
  const [firstLoad, setFirstLoad] = useState(true);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [sentToken, setSentToken] = useState(false);
  const [_, setNotification] = useState<Notifications.Notification | undefined>(
    undefined,
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const pathname = usePathname();
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [newbornBaby, setNewbornBaby] = useState<Character | null>(null);

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
          Notifications.addNotificationResponseReceivedListener(
            (response) => {},
          );

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
    if (!firstLoad && rootStore.constructed && systemColor) {
      setColorScheme(uiStore.colorScheme);
    }
  }, [uiStore.colorScheme, firstLoad, rootStore.constructed]);

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

  const handleRouting = (
    playerState: PlayerCharacter | null,
    rootStore: RootStore,
    dungeonStore: DungeonStore,
    pathname: string,
  ) => {
    if (!playerState) {
      router.replace("/NewGame/ClassSelect");
      return;
    }

    const isDead =
      rootStore.atDeathScreen ||
      playerState.currentHealth <= 0 ||
      playerState.currentSanity <= -playerState.maxSanity;

    if (isDead && pathname !== "/DeathScreen") {
      if (rootStore.dungeonStore.heldColorScheme) {
        rootStore.uiStore.setColorScheme(
          rootStore.dungeonStore.heldColorScheme,
        );

        setColorScheme(rootStore.dungeonStore.heldColorScheme);
      }
      router.replace("/DeathScreen");
      return;
    }

    if (dungeonStore.hasPersistedState) {
      router.replace("/DungeonLevel");
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      if (fontLoaded && rootStore.constructed && firstLoad) {
        setColorScheme(uiStore.colorScheme);
        await SplashScreen.hideAsync();
        handleRouting(playerState, rootStore, dungeonStore, pathname);
        setFirstLoad(false);
      }
    };

    initializeApp();
  }, [fontLoaded, rootStore.constructed, firstLoad]);

  useEffect(() => {
    if (!firstLoad && playerState) {
      const isDead =
        rootStore.atDeathScreen ||
        playerState.currentHealth <= 0 ||
        playerState.currentSanity <= -playerState.maxSanity;

      if (
        isDead &&
        pathname !== "/DeathScreen" &&
        pathname.split("/")[1] !== "NewGame"
      ) {
        setTimeout(() => {
          router.replace("/DeathScreen");
        }, 0);
      }
    }
  }, [
    firstLoad,
    playerState?.currentHealth,
    playerState?.currentSanity,
    rootStore.atDeathScreen,
  ]);

  useEffect(() => {
    if (uiStore.newbornBaby) {
      setNewbornBaby(uiStore.newbornBaby);
      setShowBirthModal(true);
      uiStore.setNewbornBaby(null);
    }
  }, [uiStore.newbornBaby]);

  const BirthAnnouncementModal = observer(() => (
    <GenericModal
      isVisibleCondition={showBirthModal}
      backFunction={() => setShowBirthModal(false)}
      accessibilityLabel="Birth Announcement"
    >
      <View className="items-center">
        <Text className="text-center text-2xl">A Child is Born!</Text>
        {newbornBaby && (
          <>
            <Text className="text-center text-xl mt-4">
              {newbornBaby.fullName}
            </Text>
            <Text className="text-center mt-2">
              Sex: {toTitleCase(newbornBaby.sex)}
            </Text>
            <View className="mt-4">
              <CharacterImage character={newbornBaby} />
            </View>
            <Text className="text-center mt-4">
              Born to: {newbornBaby.parents?.[0].fullName}
              {newbornBaby.parents?.[1] &&
                ` and ${newbornBaby.parents[1].fullName}`}
            </Text>
          </>
        )}
        <GenericFlatButton
          onPress={() => setShowBirthModal(false)}
          className="mt-4"
        >
          Close
        </GenericFlatButton>
      </View>
    </GenericModal>
  ));

  while (!fontLoaded || !rootStore.constructed) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <D20DieAnimation keepRolling={true} />
      </ThemedView>
    );
  }

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : LightTheme}>
        <SystemBars style={colorScheme == "dark" ? "light" : "dark"} />
        <ProjectedImage />
        <FleeModal />
        <BirthAnnouncementModal />

        <Stack
          screenOptions={{
            animation: uiStore.reduceMotion ? "none" : undefined,
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="NewGame"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />

          <Stack.Screen
            name="Relationships"
            options={{
              headerBackButtonDisplayMode: "minimal",
              headerBackButtonMenuEnabled: false,
              headerBackTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 16,
              },
              headerTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 22,
              },
            }}
          />
          <Stack.Screen
            name="Study"
            options={{
              title: "Magic Study",
              headerBackButtonDisplayMode: "minimal",
              headerBackButtonMenuEnabled: false,
              headerBackTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 16,
              },
              headerTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 22,
              },
            }}
          />
          <Stack.Screen
            name="Education"
            options={{
              headerBackButtonMenuEnabled: false,
              headerBackButtonDisplayMode: "minimal",
              headerTransparent: true,
              headerTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 22,
              },
              headerBackTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 16,
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
            }}
          />
          <Stack.Screen
            name="Activities"
            options={{
              headerBackButtonMenuEnabled: false,
              headerBackButtonDisplayMode: "minimal",
              headerTransparent: true,
              headerTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 22,
              },
              headerBackTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 16,
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
            }}
          />
          <Stack.Screen
            name="Investing"
            options={{
              headerBackButtonMenuEnabled: false,
              headerBackButtonDisplayMode: "minimal",
              headerTransparent: true,
              headerTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 22,
              },
              headerBackTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 16,
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
            }}
          />
          <Stack.Screen
            name="Shops/[shop]"
            options={{
              title: toTitleCase(
                (pathname.split("/")[2] ?? "").replaceAll("%20", " "),
              ),
              headerBackButtonMenuEnabled: false,
              headerBackButtonDisplayMode: "minimal",
              headerTransparent: true,
              headerTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 22,
              },
              headerBackTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 16,
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
            }}
          />
          <Stack.Screen
            name="DungeonLevel"
            options={{
              headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 20 },
              headerTransparent: true,
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
                  intensity={50}
                  style={StyleSheet.absoluteFill}
                />
              ),
              headerLeft: () => (
                <Pressable
                  onPress={() => {
                    dungeonStore.setFleeModalShowing(true);
                  }}
                >
                  {({ pressed }) => (
                    <MaterialCommunityIcons
                      name="run-fast"
                      size={28}
                      color={colorScheme == "light" ? "#18181b" : "#fafafa"}
                      style={{
                        opacity: pressed ? 0.5 : 1,
                        marginRight: Platform.OS == "android" ? 8 : 0,
                      }}
                    />
                  )}
                </Pressable>
              ),
              title: `${toTitleCase(
                dungeonStore.currentInstance?.name as string,
              )} Level ${dungeonStore.currentLevel?.level}`,
            }}
          />
          <Stack.Screen
            name="DeathScreen"
            options={{
              title: "You Died",
              headerBackButtonDisplayMode: "minimal",
              headerBackButtonMenuEnabled: false,
              headerBackTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 16,
              },
              headerTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 22,
              },
            }}
          />
          <Stack.Screen
            name="Options"
            options={{
              presentation: uiStore.reduceMotion ? "card" : "modal",
              headerBackButtonDisplayMode: "minimal",
              headerBackButtonMenuEnabled: false,
              headerBackTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 16,
              },
              headerTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 22,
              },
            }}
          />
          <Stack.Screen
            name="Auth"
            options={{
              presentation: uiStore.reduceMotion ? "card" : "modal",
              headerBackButtonMenuEnabled: false,
              headerBackTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 16,
              },
              headerTitleStyle: {
                fontFamily: "PixelifySans",
                fontSize: 22,
              },
            }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
});
export default Sentry.wrap(Root);
