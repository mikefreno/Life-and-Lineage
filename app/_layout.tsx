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
import { Monster } from "../classes/creatures";
import { fullSave, loadGame, loadPlayer } from "../utility/functions";
import { View, Text } from "react-native";
import { autorun } from "mobx";
import { useColorScheme as reactColorScheme } from "react-native";

export { ErrorBoundary } from "expo-router";
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

export const MonsterContext = createContext<
  | {
      monsterState: Monster | null;
      setMonster: React.Dispatch<React.SetStateAction<Monster | null>>;
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
  const [monsterState, setMonster] = useState<Monster | null>(null);
  const [logsState, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { setColorScheme } = useColorScheme();
  const reactScheme = reactColorScheme();

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
  }, [gameState?.colorScheme, reactScheme]);

  useEffect(() => {
    getData();
  }, []);

  autorun(() => {
    if (gameState && playerState) {
      fullSave(gameState, playerState);
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
        <MonsterContext.Provider value={{ monsterState, setMonster }}>
          <LogsContext.Provider value={{ logsState, setLogs }}>
            <RootLayout />
          </LogsContext.Provider>
        </MonsterContext.Provider>
      </PlayerCharacterContext.Provider>
    </GameContext.Provider>
  );
});

const RootLayout = () => {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  const game = gameData?.gameState;
  const playerCharacter = playerCharacterData?.playerState;
  const { colorScheme } = useColorScheme();

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
      }
    }
  }, [loaded, gameData, playerCharacter]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Options" options={{ presentation: "modal" }} />
        <Stack.Screen name="Study" options={{ presentation: "modal" }} />
        <Stack.Screen name="Crafting" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="Relationships"
          options={{ presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
};
export default Root;
