import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { getData } from "../store";
import { Game } from "../classes/game";
import { PlayerCharacter } from "../classes/character";
import { Monster } from "../classes/creatures";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const GameContext = createContext<
  | {
      gameData: Game | undefined;
      setGameData: React.Dispatch<React.SetStateAction<Game | undefined>>;
    }
  | undefined
>(undefined);

export const PlayerCharacterContext = createContext<
  | {
      playerCharacter: PlayerCharacter | undefined;
      setPlayerCharacter: React.Dispatch<
        React.SetStateAction<PlayerCharacter | undefined>
      >;
    }
  | undefined
>(undefined);

export const DungeonMonsterContext = createContext<
  | {
      monster: Monster | null;
      setMonster: React.Dispatch<React.SetStateAction<Monster | null>>;
    }
  | undefined
>(undefined);

export const BattleLogContext = createContext<
  | {
      logs: { logLine: string }[];
      setLogs: React.Dispatch<React.SetStateAction<{ logLine: string }[]>>;
    }
  | undefined
>(undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [gameData, setGameData] = useState<Game>();
  const [monster, setMonster] = useState<Monster | null>(null);
  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter>();
  const [logs, setLogs] = useState<{ logLine: string }[]>([]);

  useEffect(() => {
    const fetchGameData = async () => {
      const storedGame = await getData("game");
      if (storedGame) {
        const game = Game.fromJSON(storedGame);
        setGameData(game);
        const player = game.getPlayer();
        setPlayerCharacter(player);
      }
    };

    fetchGameData();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      if (!gameData) {
        router.push("/NewGame");
      }
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GameContext.Provider value={{ gameData, setGameData }}>
      <PlayerCharacterContext.Provider
        value={{ playerCharacter, setPlayerCharacter }}
      >
        <DungeonMonsterContext.Provider value={{ monster, setMonster }}>
          <BattleLogContext.Provider value={{ logs, setLogs }}>
            <RootLayoutNav />
          </BattleLogContext.Provider>
        </DungeonMonsterContext.Provider>
      </PlayerCharacterContext.Provider>
    </GameContext.Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Settings" options={{ presentation: "modal" }} />
        <Stack.Screen name="Study" options={{ presentation: "modal" }} />
        <Stack.Screen name="Crafting" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="Relationships"
          options={{ presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
