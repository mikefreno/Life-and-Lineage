import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router } from "expo-router";
import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useCallback,
} from "react";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import { Game } from "../classes/game";
import { PlayerCharacter } from "../classes/character";
import { Enemy } from "../classes/creatures";
import { fullSave, fullLoad } from "../utility/functions/save_load";
import { Dimensions, Keyboard, Platform, StyleSheet } from "react-native";
import { View as ThemedView } from "../components/Themed";
import { autorun } from "mobx";
import "../assets/styles/globals.css";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { throttle } from "lodash";
import { BlurView } from "expo-blur";
import * as Sentry from "@sentry/react-native";
import { AppContextType } from "../utility/types";
import { AuthProvider, useAuth } from "../auth/AuthContext";
import D20DieAnimation from "../components/DieRollAnim";

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

export const AppContext = createContext<AppContextType | undefined>(undefined);

Sentry.init({
  dsn: "https://2cff54f8aeb50bcb7151c159cc40fe1b@o4506630160187392.ingest.sentry.io/4506630163398656",
  debug: false, // __DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

const Root = observer(() => {
  const [gameState, setGameData] = useState<Game>();
  const [playerState, setPlayerCharacter] = useState<PlayerCharacter>();
  const [enemyState, setEnemy] = useState<Enemy | null>(null);
  const [logsState, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameDate, setGameDate] = useState<string>("");
  const [playerStatusCompact, setPlayerStatusCompact] = useState<boolean>(true);
  const [showDetailedStatusView, setShowDetailedStatusView] =
    useState<boolean>(false);
  const { setColorScheme, colorScheme } = useColorScheme();

  const getData = async () => {
    try {
      const { game, player } = await fullLoad();

      if (game) {
        setGameData(game);
        setColorScheme(game.colorScheme);
        setGameDate(game.date);
      }
      if (player) {
        setPlayerCharacter(player);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (gameState) {
      setColorScheme(gameState.colorScheme);
    }
  }, [gameState?.colorScheme, colorScheme]);

  useEffect(() => {
    getData();
  }, []);

  const throttledFullSave = throttle(fullSave, 2000);

  autorun(() => throttledFullSave(gameState, playerState));

  const [dimensions, setDimensions] = useState(() => ({
    height: Dimensions.get("screen").height,
    width: Dimensions.get("screen").width,
    greater: Math.max(
      Dimensions.get("screen").height,
      Dimensions.get("screen").width,
    ),
    lesser: Math.min(
      Dimensions.get("screen").height,
      Dimensions.get("screen").width,
    ),
  }));

  const onChange = useCallback(
    ({
      screen,
    }: {
      screen: {
        width: number;
        height: number;
        scale: number;
        fontScale: number;
      };
    }) => {
      setDimensions({
        height: screen.height,
        width: screen.width,
        greater: Math.max(screen.height, screen.width),
        lesser: Math.min(screen.width, screen.height),
      });
    },
    [],
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", onChange);

    return () => {
      subscription.remove();
    };
  }, [onChange]);

  while (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <D20DieAnimation keepRolling={loading} />
      </ThemedView>
    );
  }

  return (
    <AuthProvider>
      <AppContext.Provider
        value={{
          gameState,
          setGameData,
          playerState,
          setPlayerCharacter,
          enemyState,
          setEnemy,
          logsState,
          setLogs,
          isCompact: playerStatusCompact,
          setIsCompact: setPlayerStatusCompact,
          showDetailedStatusView,
          setShowDetailedStatusView,
          dimensions,
        }}
      >
        <RootLayout />
      </AppContext.Provider>
    </AuthProvider>
  );
});

const RootLayout = observer(() => {
  const [fontLoaded] = useFonts({
    PixelifySans: require("../assets/fonts/PixelifySans-Regular.ttf"),
  });
  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("missing context");
  }
  const { playerState, gameState } = appData;
  const { colorScheme } = useColorScheme();
  const [firstLoad, setFirstLoad] = useState(true);
  const [navbarLoad, setNavbarLoad] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  //const auth = useAuth();

  //useEffect(() => {
  //if (__DEV__) {
  //auth._debugLog();
  //}
  //}, []);

  useEffect(() => {
    if (fontLoaded && navbarLoad) {
      SplashScreen.hideAsync();
      if (!playerState) {
        router.replace("/NewGame");
      } else if (
        gameState?.atDeathScreen ||
        (playerState && (playerState.health <= 0 || playerState.sanity <= -50))
      ) {
        while (router.canGoBack()) {
          router.back();
        }
        router.replace("/DeathScreen");
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
  }, [fontLoaded, navbarLoad, playerState]);

  useEffect(() => {
    if (fontLoaded && navbarLoad) {
      if (
        playerState &&
        (playerState.sanity <= -50 || playerState.health <= 0)
      ) {
        while (router.canGoBack()) {
          router.back();
        }
        router.replace("/DeathScreen");
      }
    }
  }, [playerState?.sanity, playerState?.health]);

  useEffect(() => {
    getAndSetNavBar();
  }, [colorScheme, isKeyboardVisible]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  async function getAndSetNavBar() {
    if (Platform.OS === "android") {
      const isVisible =
        (await NavigationBar.getVisibilityAsync()) === "visible";
      if (isKeyboardVisible && !isVisible) {
        await NavigationBar.setVisibilityAsync("visible");
        await NavigationBar.setPositionAsync("relative");
        await NavigationBar.setBehaviorAsync("inset-touch");
      } else if (!isKeyboardVisible && isVisible) {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      }
      if (!navbarLoad) {
        setNavbarLoad(true);
      }
    } else {
      setNavbarLoad(true);
    }
  }
  while (!fontLoaded) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <D20DieAnimation keepRolling={!fontLoaded} />
      </ThemedView>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme == "light" ? "dark" : "light"} />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            animation: Platform.OS == "android" ? "none" : undefined,
            autoHideHomeIndicator: true,
          }}
        />
        <Stack.Screen
          name="Auth"
          options={{
            presentation: "modal",
            headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          }}
        />
        <Stack.Screen
          name="Options"
          options={{
            presentation: "modal",
            headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          }}
        />
        <Stack.Screen
          name="Relationships"
          options={{
            headerBackTitleVisible: false,
            headerTransparent: true,
            headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
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
            headerBackTitleVisible: false,
            headerTransparent: true,
            headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
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
      </Stack>
    </ThemeProvider>
  );
});
export default Sentry.wrap(Root);
