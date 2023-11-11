import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Link, SplashScreen, Stack, router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Pressable, useColorScheme } from "react-native";
import { getData } from "../store";
import { Game } from "../classes/game";
import { PlayerCharacter } from "../classes/character";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "react-native/Libraries/NewAppScreen";

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

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [gameData, setGameData] = useState<Game>();
  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter>();

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
        <RootLayoutNav />
      </PlayerCharacterContext.Provider>
    </GameContext.Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const gameContext = useContext(GameContext);

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
        <Stack.Screen
          name="NewGame"
          options={{
            presentation: "fullScreenModal",
            headerLeft: () =>
              gameContext?.gameData ? (
                <Pressable onPress={() => router.push("/")}>
                  {({ pressed }) => (
                    <MaterialIcons
                      name="cancel"
                      size={36}
                      color={colorScheme == "dark" ? "#fafafa" : "#27272a"}
                      style={{
                        marginLeft: 15,
                        marginBottom: 5,
                        opacity: pressed ? 0.5 : 1,
                      }}
                    />
                  )}
                </Pressable>
              ) : null,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
