import { useFonts } from "expo-font";
import { Stack, router, usePathname } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Text } from "../components/Themed";
import { BlurView } from "expo-blur";
import * as Sentry from "@sentry/react-native";
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
import { useStyles } from "../hooks/styles";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: Platform.OS === "ios",
});

Sentry.init({
  dsn: "https://2cff54f8aeb50bcb7151c159cc40fe1b@o4506630160187392.ingest.sentry.io/4506630163398656",
  //@ts-ignore
  //replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,
  //replaysOnErrorSampleRate: 1.0,
  //integrations: [
  //Sentry.mobileReplayIntegration({
  //maskAllText: false,
  //maskAllImages: false,
  //maskAllVectors: false,
  //}),
  //],
  debug: false, //__DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

/**
 * This wraps the entire app, loads the player data, sets up user app settings and holds&sets the `AppContext`.
 * The responsibility of this is largely around unseen app state, whereas `RootLayout` is largely concerned with UI
 */
const Root = observer(() => {
  const [mainFontLoaded, error] = useFonts({
    PixelifySans: require("../assets/fonts/PixelifySans-Regular.ttf"),
  });

  const [otherFontsLoaded] = useFonts({
    Handwritten: require("../assets/fonts/Caveat-VariableFont_wght.ttf"),
    Cursive: require("../assets/fonts/Tangerine-Regular.ttf"),
    CursiveBold: require("../assets/fonts/Tangerine-Bold.ttf"),
  });

  useEffect(() => {
    if (error) {
      console.error(error);
    }
    if (mainFontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [mainFontLoaded, error]);

  while (!mainFontLoaded) {
    return null;
  }

  return (
    <AppProvider>
      <DungeonProvider>
        <SafeAreaProvider>
          <ErrorBoundary>
            <LoadingBoundary>
              <RootLayout fontLoaded={mainFontLoaded} />
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
const RootLayout = observer(({ fontLoaded }: { fontLoaded: boolean }) => {
  const rootStore = useRootStore();
  const { playerState, dungeonStore, uiStore, audioStore, shopsStore } =
    rootStore;
  const styles = useStyles();

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
      wait(350).then(() => uiStore.markStoreAsLoaded("routing"));
      return;
    }

    const isDead =
      rootStore.atDeathScreen ||
      playerState.currentHealth <= 0 ||
      playerState.currentSanity <= -playerState.maxSanity;

    if (isDead && pathname !== "/DeathScreen") {
      router.replace("/DeathScreen");
      wait(350).then(() => uiStore.markStoreAsLoaded("routing"));
      return;
    }

    if (dungeonStore.hasPersistedState) {
      router.replace("/DungeonLevel");
      wait(350).then(() => uiStore.markStoreAsLoaded("routing"));
      return;
    }

    uiStore.markStoreAsLoaded("routing");
  };

  useEffect(() => {
    const initializeApp = async () => {
      if (
        fontLoaded &&
        rootStore.constructed &&
        firstLoad &&
        audioStore.isAmbientLoaded
      ) {
        uiStore.markStoreAsLoaded("fonts");
        handleRouting(playerState, rootStore, dungeonStore, pathname);
        setFirstLoad(false);
      }
    };

    initializeApp();
  }, [
    fontLoaded,
    rootStore.constructed,
    firstLoad,
    audioStore.isAmbientLoaded,
  ]);

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
      <View style={styles.itemsCenter}>
        <Text style={{ ...styles["2xl"], ...styles.textCenter }}>
          A Child is Born!
        </Text>
        {newbornBaby && (
          <>
            <Text style={{ ...styles.xl, ...styles.textCenter, ...styles.mt4 }}>
              {newbornBaby.fullName}
            </Text>
            <Text style={{ ...styles.textCenter, ...styles.mt2 }}>
              Sex: {toTitleCase(newbornBaby.sex)}
            </Text>
            <View style={styles.mt4}>
              <CharacterImage character={newbornBaby} />
            </View>
            <Text style={{ ...styles.textCenter, ...styles.mt4 }}>
              Born to: {newbornBaby.parents?.[0].fullName}
              {newbornBaby.parents?.[1] &&
                ` and ${newbornBaby.parents[1].fullName}`}
            </Text>
          </>
        )}
        <GenericFlatButton
          onPress={() => setShowBirthModal(false)}
          style={styles.mt4}
        >
          Close
        </GenericFlatButton>
      </View>
    </GenericModal>
  ));

  return (
    <GestureHandlerRootView>
      <ThemeProvider
        value={uiStore.colorScheme === "dark" ? DarkTheme : LightTheme}
      >
        <SystemBars style={uiStore.colorScheme == "dark" ? "light" : "dark"} />
        <ProjectedImage />
        <FleeModal />
        <BirthAnnouncementModal />
        <Stack
          screenOptions={{
            animation: uiStore.reduceMotion ? "none" : undefined,
          }}
        >
          <Stack.Screen
            name="NewGame"
            options={{
              headerShown: false,
              presentation: "card",
              animation: !playerState ? "fade" : undefined,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Options"
            options={{
              presentation: "modal",
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
                      ? uiStore.colorScheme == "light"
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
                      ? uiStore.colorScheme == "light"
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
                      ? uiStore.colorScheme == "light"
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
            name="ShopInterior"
            options={{
              title: toTitleCase(shopsStore.currentShop?.archetype),
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
                      ? uiStore.colorScheme == "light"
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
                      ? uiStore.colorScheme == "light"
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
                      color={
                        uiStore.colorScheme == "light" ? "#18181b" : "#fafafa"
                      }
                      style={{
                        opacity: pressed ? 0.5 : 1,
                        marginRight: Platform.OS == "android" ? 8 : 0,
                      }}
                    />
                  )}
                </Pressable>
              ),
              title:
                dungeonStore.currentInstance?.name.toLowerCase() ===
                "training grounds"
                  ? "Training Grounds"
                  : `${toTitleCase(
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
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
});
export default Sentry.wrap(Root);
