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
  useRef,
} from "react";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import { Game } from "../classes/game";
import { PlayerCharacter } from "../classes/character";
import { Enemy } from "../classes/creatures";
import { fullSave, fullLoad } from "../utility/functions/save_load";
import { Dimensions, Keyboard, Platform, StyleSheet } from "react-native";
import { View as ThemedView } from "../components/Themed";
import { reaction } from "mobx";
import "../assets/styles/globals.css";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import * as Sentry from "@sentry/react-native";
import { AppContextType } from "../utility/types";
import { AuthProvider } from "../auth/AuthContext";
import D20DieAnimation from "../components/DieRollAnim";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  console.log(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!",
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      //__DEV__ && console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

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
  const [blockSize, setBlockSize] = useState<number>();
  const { setColorScheme, colorScheme } = useColorScheme();

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
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
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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

  reaction(
    () => ({
      gameTime: gameState?.date,
    }),
    (state) => {
      if (gameState && playerState && state.gameTime !== gameDate) {
        setGameDate(gameState.date);
        fullSave(gameState, playerState);
      }
    },
  );

  const [dimensions, setDimensions] = useState(() => ({
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    greater: Math.max(
      Dimensions.get("window").height,
      Dimensions.get("window").width,
    ),
    lesser: Math.min(
      Dimensions.get("window").height,
      Dimensions.get("window").width,
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
          blockSize,
          setBlockSize,
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
