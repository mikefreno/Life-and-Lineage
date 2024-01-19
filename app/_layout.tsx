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
import { fullSave, loadGame, loadPlayer } from "../utility/functions";
import { View, Text, Platform } from "react-native";
import { autorun } from "mobx";
import "../assets/styles/globals.css";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { usePathname } from "expo-router";
import { debounce } from "lodash";

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
  const game = gameData?.gameState;
  const playerCharacter = playerCharacterData?.playerState;
  const { colorScheme } = useColorScheme();
  const [firstLoad, setFirstLoad] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      if (!playerCharacter || !game) {
        router.replace("/NewGame");
      } else if (
        gameData?.gameState?.atDeathScreen ||
        (playerCharacter &&
          (playerCharacter.health <= 0 || playerCharacter.sanity <= -50))
      ) {
        while (router.canGoBack()) {
          router.back();
        }
        router.replace("/DeathScreen");
      } else if (playerCharacter.currentDungeon && firstLoad) {
        while (router.canGoBack()) {
          router.back();
        }
        router.replace(
          `/DungeonLevel/${playerCharacter.currentDungeon.instance}/${playerCharacter.currentDungeon.level}`,
        );
      }
      setFirstLoad(false);
    }
  }, [loaded, gameData, playerCharacter]);

  useEffect(() => {
    getAndSetNavBar();
  }, [pathname, colorScheme]);

  async function getAndSetNavBar() {
    if (Platform.OS == "android") {
      if ((await NavigationBar.getVisibilityAsync()) == "visible") {
        let unTabbedPath = false;
        if (pathname.split("/").length > 0) {
          unTabbedPath = ["DungeonLevel", "NewGame"].includes(
            pathname.split("/")[1],
          );
        }
        NavigationBar.setBackgroundColorAsync(
          colorScheme == "light"
            ? unTabbedPath
              ? "#fafafa"
              : "white"
            : unTabbedPath
            ? "#18181b"
            : "#121212",
        );
      }
    }
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme == "light" ? "dark" : "light"} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Options" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="Relationships"
          options={{ presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
});
export default Root;
