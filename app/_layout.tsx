import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { loadGame, loadPlayer } from "../utility/functions";
import { Game } from "../classes/game";
import { Provider, useDispatch, useSelector } from "react-redux";
import store, { AppDispatch } from "../redux/store";
import { setGameData, setPlayerCharacter } from "../redux/slice/game";
import { selectGame, selectPlayerCharacter } from "../redux/selectors";
import { PlayerCharacter } from "../classes/character";
import { useColorScheme as nativeColorScheme } from "nativewind";

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

export default function Root() {
  return (
    <Provider store={store}>
      <RootLayout />
    </Provider>
  );
}

function RootLayout() {
  const dispatch: AppDispatch = useDispatch();
  const gameData = useSelector(selectGame);
  const playerCharacter = useSelector(selectPlayerCharacter);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [gameAndPlayerLoaded, setGameAndPlayerLoaded] = useState(false);

  const { setColorScheme, colorScheme } = nativeColorScheme();

  useEffect(() => {
    const fetchGameData = async () => {
      const storedGame = await loadGame();
      const storedPlayer = await loadPlayer();

      if (storedGame) {
        const game = Game.fromJSON(storedGame);
        setColorScheme(game.getColorScheme());
        dispatch(setGameData(game));
      }

      if (storedPlayer) {
        const player = PlayerCharacter.fromJSON(storedPlayer);
        dispatch(setPlayerCharacter(player));
      }

      setGameAndPlayerLoaded(true);
    };

    fetchGameData();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && gameAndPlayerLoaded) {
      SplashScreen.hideAsync();
      if (!playerCharacter || !gameData) {
        router.replace("/NewGame");
      } else if (
        gameData.getAtDeathScreen() ||
        (playerCharacter && playerCharacter.getHealth() <= 0)
      ) {
        router.replace("/DeathScreen");
      }
    }
  }, [loaded, gameAndPlayerLoaded, gameData, playerCharacter]);

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
