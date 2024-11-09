import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router, usePathname } from "expo-router";
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
import { Dimensions, Platform, StyleSheet } from "react-native";
import { ThemedView } from "../components/Themed";
import "../assets/styles/globals.css";
import { BlurView } from "expo-blur";
import * as Sentry from "@sentry/react-native";
import { AppContextType } from "../utility/types";
import { AuthProvider } from "../auth/AuthContext";
import D20DieAnimation from "../components/DieRollAnim";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { toTitleCase, wait } from "../utility/functions/misc";
import { API_BASE_URL } from "../config/config";
import { fullLoad } from "../utility/functions/save_load";
import { SystemBars } from "react-native-edge-to-edge";
import { DarkTheme, LightTheme } from "../constants/Colors";

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
  debug: __DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
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
  }
}

/**
 * This wraps the entire app, loads the player data, sets up user app settings and holds&sets the `AppContext`.
 * The responsibility of this is largely around unseen app state, whereas `RootLayout` is largely concerned with UI
 */
const Root = observer(() => {
  const [gameState, setGameData] = useState<Game>();
  const [playerState, setPlayerCharacter] = useState<PlayerCharacter>();
  const [enemyState, setEnemy] = useState<Enemy | null>(null);
  const [logsState, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerStatusCompact, setPlayerStatusCompact] = useState<boolean>(true);
  const [showDetailedStatusView, setShowDetailedStatusView] =
    useState<boolean>(false);
  const [blockSize, setBlockSize] = useState<number>();
  const { setColorScheme } = useColorScheme();

  const loadData = async () => {
    try {
      const { game, player } = await fullLoad();

      if (game && player) {
        game.refreshAllShops(player);
        setGameData(game);
        setColorScheme(game.colorScheme);
        player.reinstateLinks();
        setPlayerCharacter(player);
      }

      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (gameState) {
      setColorScheme(gameState.colorScheme);
    }
  }, [gameState?.colorScheme]);

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

  useEffect(() => {
    if (dimensions.width === dimensions.lesser) {
      const blockSize = Math.min(dimensions.height / 5, dimensions.width / 7.5);
      setBlockSize(blockSize);
    } else {
      const blockSize = dimensions.width / 14;
      setBlockSize(blockSize);
    }
  }, [dimensions.height]);

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
        <SafeAreaProvider>
          <RootLayout />
        </SafeAreaProvider>
      </AppContext.Provider>
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
  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("missing context");
  }

  const { playerState, gameState } = appData;
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
    if (fontLoaded) {
      SplashScreen.hideAsync();
      if (!playerState) {
        router.replace("/NewGame");
      } else if (
        gameState?.atDeathScreen ||
        (playerState &&
          (playerState.currentHealth <= 0 || playerState.currentSanity <= -50))
      ) {
        if (pathname !== "/DeathScreen")
          wait(500).then(() => {
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
          options={headerOptions({ title: "Class Select" })}
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
