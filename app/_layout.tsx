import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router } from "expo-router";
import { createContext, useEffect, useContext, useState } from "react";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import { Game } from "../classes/game";
import { PlayerCharacter } from "../classes/character";
import { Enemy } from "../classes/creatures";
import { fullSave, loadGame, loadPlayer } from "../utility/functions/save_load";
import { View, Text, Platform, StyleSheet } from "react-native";
import { autorun } from "mobx";
import "../assets/styles/globals.css";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { debounce } from "lodash";
import { BlurView } from "expo-blur";
import * as Sentry from "@sentry/react-native";

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

export const GameContext = createContext<
  | {
      gameState: Game | undefined;
      setGameData: React.Dispatch<React.SetStateAction<Game | undefined>>;
    }
  | undefined
>(undefined);

export const PlayerCharacterContext = createContext<
  | {
      playerState: PlayerCharacter | undefined;
      setPlayerCharacter: React.Dispatch<
        React.SetStateAction<PlayerCharacter | undefined>
      >;
    }
  | undefined
>(undefined);

export const EnemyContext = createContext<
  | {
      enemyState: Enemy | null;
      setEnemy: React.Dispatch<React.SetStateAction<Enemy | null>>;
    }
  | undefined
>(undefined);

export const LogsContext = createContext<
  | {
      logsState: string[];
      setLogs: React.Dispatch<React.SetStateAction<string[]>>;
    }
  | undefined
>(undefined);

Sentry.init({
  dsn: "https://2cff54f8aeb50bcb7151c159cc40fe1b@o4506630160187392.ingest.sentry.io/4506630163398656",
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

const Root = observer(() => {
  const [gameState, setGameData] = useState<Game>();
  const [playerState, setPlayerCharacter] = useState<PlayerCharacter>();
  const [enemyState, setEnemy] = useState<Enemy | null>(null);
  const [logsState, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { setColorScheme, colorScheme } = useColorScheme();

  const getData = async () => {
    try {
      const storedPlayerData = await loadPlayer();
      const storedGameData = await loadGame();

      if (storedGameData) {
        setGameData(Game.fromJSON(storedGameData));
        setColorScheme(storedGameData.colorScheme);
      }
      if (storedPlayerData) {
        setPlayerCharacter(PlayerCharacter.fromJSON(storedPlayerData));
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

  const debouncedFullSave = debounce(fullSave, 500);

  autorun(() => {
    if (gameState && playerState) {
      debouncedFullSave(gameState, playerState);
      debouncedFullSave.flush();
    }
  });

  while (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GameContext.Provider value={{ gameState, setGameData }}>
      <PlayerCharacterContext.Provider
        value={{ playerState, setPlayerCharacter }}
      >
        <EnemyContext.Provider value={{ enemyState, setEnemy }}>
          <LogsContext.Provider value={{ logsState, setLogs }}>
            <RootLayout />
          </LogsContext.Provider>
        </EnemyContext.Provider>
      </PlayerCharacterContext.Provider>
    </GameContext.Provider>
  );
});

const RootLayout = observer(() => {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  const enemyData = useContext(EnemyContext);
  if (!gameData || !playerCharacterData || !enemyData) {
    throw new Error("missing context");
  }
  const { gameState } = gameData;
  const { playerState } = playerCharacterData;
  const { setEnemy } = enemyData;
  const { colorScheme } = useColorScheme();
  const [firstLoad, setFirstLoad] = useState(true);
  const [navbarLoad, setNavbarLoad] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && navbarLoad) {
      SplashScreen.hideAsync();
      if (!playerState || !gameState) {
        router.replace("/NewGame");
      } else if (
        gameData?.gameState?.atDeathScreen ||
        (playerState && (playerState.health <= 0 || playerState.sanity <= -50))
      ) {
        while (router.canGoBack()) {
          router.back();
        }
        router.replace("/DeathScreen");
      } else if (playerState.currentDungeon && firstLoad) {
        if (playerState.savedEnemy) {
          setEnemy(playerState.savedEnemy);
        }
        while (router.canGoBack()) {
          router.back();
        }
        router.replace(
          `/DungeonLevel/${playerState.currentDungeon?.instance}/${playerState.currentDungeon?.level}`,
        );
      }
      setFirstLoad(false);
    }
  }, [loaded, navbarLoad, gameData, playerState]);

  useEffect(() => {
    getAndSetNavBar();
  }, []);

  async function getAndSetNavBar() {
    if (Platform.OS == "android") {
      if ((await NavigationBar.getVisibilityAsync()) == "visible") {
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setBackgroundColorAsync("transparent");
        if (!navbarLoad) {
          setNavbarLoad(true);
        }
      }
    } else {
      setNavbarLoad(true);
    }
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
          }}
        />
        <Stack.Screen
          name="Options"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="Relationships"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="Shops/[shop]"
          options={{
            headerBackTitleVisible: false,
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
