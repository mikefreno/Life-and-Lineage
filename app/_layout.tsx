import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Platform, Pressable, View, StyleSheet, UIManager } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toTitleCase, wait } from "@/utility/functions/misc";
import { SystemBars } from "react-native-edge-to-edge";
import { DarkTheme, LightTheme } from "@/constants/Colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRootStore } from "@/hooks/stores";
import { ProjectedImage } from "@/components/Draggable";
import { AppProvider } from "@/providers/AppData";
import { ThemeProvider } from "@react-navigation/native";
import FleeModal from "@/components/DungeonComponents/FleeModal";
import { DungeonProvider } from "@/providers/DungeonData";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingBoundary } from "@/components/LoadingBoundary";
import { PlayerCharacter } from "@/entities/character";
import { RootStore } from "@/stores/RootStore";
import { DungeonStore } from "@/stores/DungeonStore";
import { useStyles } from "@/hooks/styles";
import { DevControls } from "@/components/DevControls";
import BoundsVisualizer from "@/components/BoundsVisualizer";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import PlatformDependantGestureWrapper from "@/components/PlatformDependantGestureWrapper";
import { SCREEN_TRANSITION_TIMING } from "@/stores/UIStore";
import { decode } from "base-64";
import { useScaling } from "@/hooks/scaling";
import TutorialModal from "@/components/TutorialModal";
import { TutorialOption } from "@/utility/types";
import { HeaderBackButton } from "@react-navigation/elements";
import { useVibration } from "@/hooks/generic";
import { AudioToggle } from "@/components/AudioToggle";
import { BirthAnnouncementModal } from "@/components/BirthAnnouncementModal";
import { NewFeatureNotifier } from "@/stores/NewFeatureNotifier";
import NewFeaturesModal from "@/components/NewFeaturesModal";

global.atob = decode;

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export const tabRouteIndexing = [
  "/",
  "/spells",
  "/labor",
  "/shops",
  "/medical",
  "/dungeon",
];

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: Platform.OS === "ios",
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
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
const Root = () => {
  const [mainFontLoaded, error] = useFonts({
    PixelifySans: require("@/assets/fonts/PixelifySans-Regular.ttf"),
  });

  const [otherFontsLoaded] = useFonts({
    Handwritten: require("@/assets/fonts/Caveat-VariableFont_wght.ttf"),
    Cursive: require("@/assets/fonts/Tangerine-Regular.ttf"),
    CursiveBold: require("@/assets/fonts/Tangerine-Bold.ttf"),
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
};

/**
 * This focuses on getting the UI set, and relieving the splash screen when ready
 */
const RootLayout = observer(({ fontLoaded }: { fontLoaded: boolean }) => {
  const rootStore = useRootStore();
  const {
    playerState,
    dungeonStore,
    uiStore,
    audioStore,
    showReachedEndOfCompletedDungeonsMessage,
    closeReachedEndOfCompletedDungeonsMessage,
  } = rootStore;
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    uiStore.setInsets(insets);
  }, [insets]);

  const [firstLoad, setFirstLoad] = useState(true);
  const vibration = useVibration();

  const pathname = usePathname();
  const { getNormalizedSize } = useScaling();

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
      playerState.currentSanity! <= -playerState.maxSanity!;

    if (isDead && pathname !== "/DeathScreen") {
      router.replace("/DeathScreen");
      wait(350).then(() => {
        uiStore.markStoreAsLoaded("routing");
      });
      return;
    }

    if (dungeonStore.hasPersistedState) {
      router.replace("/DungeonLevel");
      wait(350).then(() => {
        uiStore.markStoreAsLoaded("routing");
      });
      return;
    }

    uiStore.markStoreAsLoaded("routing");
  };

  useEffect(() => {
    const initializePurchases = async () => {};
    initializePurchases();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      if (fontLoaded && rootStore.constructed && firstLoad) {
        uiStore.markStoreAsLoaded("fonts");
        handleRouting(playerState, rootStore, dungeonStore, pathname);
        setFirstLoad(false);
      }
    };

    initializeApp();
  }, [
    fontLoaded,
    rootStore.constructed,
    uiStore.storeLoadingStatus,
    firstLoad,
  ]);

  useEffect(() => {
    if (!firstLoad && playerState) {
      const isDead =
        rootStore.atDeathScreen ||
        playerState.currentHealth <= 0 ||
        playerState.currentSanity! <= -playerState.maxSanity!;

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
    return () => {
      audioStore.cleanup();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      rootStore.setPathname(pathname.toLowerCase());
    }, SCREEN_TRANSITION_TIMING);
  }, [pathname]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlatformDependantGestureWrapper>
        <ThemeProvider
          value={uiStore.colorScheme === "dark" ? DarkTheme : LightTheme}
        >
          <SystemBars
            style={uiStore.colorScheme == "dark" ? "light" : "dark"}
          />
          <NewFeaturesModal />
          <ProjectedImage />
          <FleeModal />
          <BirthAnnouncementModal />
          <TutorialModal
            isFocused={true}
            secondaryCondition={showReachedEndOfCompletedDungeonsMessage}
            onCloseFunction={closeReachedEndOfCompletedDungeonsMessage}
            tutorial={TutorialOption.reachedEndOfCompletedDungeons}
            pageOne={{
              title: "You have reached the end....",
              body: "(for now)",
            }}
            pageTwo={{
              title: "There is more to come",
              body: "And we're excited for you to experience it!",
            }}
          />
          {__DEV__ && (
            <>
              <DevControls />
              {uiStore.showDevDebugUI && <BoundsVisualizer />}
            </>
          )}
          <Stack
            screenOptions={{
              animation: uiStore.reduceMotion ? "fade" : undefined,
              animationDuration: SCREEN_TRANSITION_TIMING,
              fullScreenGestureEnabled: true,
            }}
          >
            <Stack.Screen
              name="NewGame"
              options={{
                headerShown: false,
                presentation: "card",
                animation: !playerState ? "fade" : "default",
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
                animation: uiStore.reduceMotion ? "fade" : "slide_from_left",
                presentation: "card",
                headerBackButtonDisplayMode: "minimal",
                headerBackButtonMenuEnabled: false,
                headerBackTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(16),
                },
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
              }}
            />
            <Stack.Screen
              name="Auth"
              options={{
                presentation: "card",
                headerBackButtonMenuEnabled: false,
                headerBackTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(16),
                },
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
              }}
            />
            <Stack.Screen
              name="FrenoDotMeWebview"
              options={{
                presentation: "modal",
                headerShown: false,
                headerBackButtonMenuEnabled: false,
                headerBackTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(16),
                },
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
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
                  fontSize: getNormalizedSize(16),
                },
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
              }}
            />
            <Stack.Screen
              name="Study"
              options={{
                title: "Magic Study",
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
                headerBackButtonDisplayMode: "minimal",
                headerTransparent: true,
                headerBackground: () => (
                  <View style={[StyleSheet.absoluteFill, styles.diffuse]}>
                    <BlurView
                      intensity={50}
                      style={[StyleSheet.absoluteFill]}
                      tint={uiStore.colorScheme}
                    />
                  </View>
                ),
              }}
            />
            <Stack.Screen
              name="Education"
              options={{
                animation: uiStore.reduceMotion ? "fade" : "slide_from_left",
                headerBackButtonMenuEnabled: false,
                headerBackButtonDisplayMode: "minimal",
                headerTransparent: true,
                headerBackTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(16),
                },
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
                headerBackground: () => (
                  <View style={[StyleSheet.absoluteFill, styles.diffuse]}>
                    <BlurView
                      intensity={50}
                      style={[StyleSheet.absoluteFill]}
                      tint={uiStore.colorScheme}
                    />
                  </View>
                ),
              }}
            />
            <Stack.Screen
              name="Activities"
              options={{
                headerBackButtonMenuEnabled: false,
                headerBackButtonDisplayMode: "minimal",
                headerTransparent: true,
                headerBackTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(16),
                },
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
                headerBackground: () => (
                  <View style={[StyleSheet.absoluteFill, styles.diffuse]}>
                    <BlurView
                      intensity={50}
                      style={[StyleSheet.absoluteFill]}
                      tint={uiStore.colorScheme}
                    />
                  </View>
                ),
              }}
            />
            <Stack.Screen
              name="Investing"
              options={{
                headerBackButtonMenuEnabled: false,
                headerBackButtonDisplayMode: "minimal",
                headerTransparent: true,
                headerBackTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(16),
                },
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
                headerBackground: () => (
                  <BlurView
                    intensity={100}
                    style={StyleSheet.absoluteFill}
                    tint={uiStore.colorScheme}
                  />
                ),
              }}
            />
            <Stack.Screen name="ShopInterior" />
            <Stack.Screen
              name="PVPArena"
              options={{
                animation: uiStore.reduceMotion ? "fade" : "slide_from_left",
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
                headerStyle: {
                  height: 44 + (uiStore.insets?.top ?? 0),
                },
                headerTransparent: true,
                headerBackground: () => (
                  <View style={[StyleSheet.absoluteFill, styles.diffuse]}>
                    <BlurView
                      intensity={50}
                      style={[StyleSheet.absoluteFill]}
                      tint={uiStore.colorScheme}
                    />
                  </View>
                ),
                headerLeft: ({ tintColor }) => (
                  <HeaderBackButton
                    onPress={() => {
                      vibration({ style: "light" });
                      router.replace("/(tabs)/dungeon");
                    }}
                    tintColor={tintColor}
                    displayMode="generic"
                    style={{ marginLeft: -16 }}
                  />
                ),
                headerRight: () => <AudioToggle />,
                title: "PvP Home",
              }}
            />
            <Stack.Screen
              name="DungeonLevel"
              options={{
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
                headerStyle: {
                  height: 44 + (uiStore.insets?.top ?? 0),
                },
                headerTransparent: true,
                headerBackground: () => (
                  <View style={[StyleSheet.absoluteFill, styles.diffuse]}>
                    <BlurView
                      intensity={50}
                      style={[StyleSheet.absoluteFill]}
                      tint={uiStore.colorScheme}
                    />
                  </View>
                ),
                headerLeft: () => (
                  <Pressable
                    onPress={() => {
                      vibration({ style: "light" });
                      dungeonStore.setFleeModalShowing(true);
                    }}
                  >
                    {({ pressed }) => (
                      <MaterialCommunityIcons
                        name="run-fast"
                        size={uiStore.iconSizeXL}
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
                headerRight: () => <AudioToggle />,
                title: dungeonStore.currentLevel?.nameOverride
                  ? dungeonStore.currentLevel?.nameOverride
                  : dungeonStore.currentInstance?.name.toLowerCase() ===
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
                animation: uiStore.reduceMotion ? "fade" : "default",
                title: "You Died",
                headerBackButtonDisplayMode: "minimal",
                headerBackButtonMenuEnabled: false,
                headerBackTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(16),
                },
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
                headerStyle: {
                  height: 44 + (uiStore.insets?.top ?? 0),
                },
              }}
            />
            <Stack.Screen
              name="_sitemap"
              options={{
                headerBackButtonDisplayMode: "minimal",
                headerBackButtonMenuEnabled: false,
                headerBackTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(16),
                },
                headerTitleStyle: {
                  fontFamily: "PixelifySans",
                  fontSize: getNormalizedSize(22),
                },
              }}
            />
          </Stack>
        </ThemeProvider>
      </PlatformDependantGestureWrapper>
    </GestureHandlerRootView>
  );
});

export default Sentry.wrap(Root);
