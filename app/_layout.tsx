import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router } from "expo-router";
import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { selectGame, selectPlayerCharacter } from "../redux/selectors";
import { useColorScheme as nativeColorScheme } from "nativewind";
import { PersistGate } from "redux-persist/integration/react";
import storeCreator from "../redux/persist";

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
  const { store, persistor } = storeCreator();
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayout />
      </PersistGate>
    </Provider>
  );
}

function RootLayout() {
  const gameData = useSelector(selectGame);
  const playerCharacter = useSelector(selectPlayerCharacter);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const { setColorScheme, colorScheme } = nativeColorScheme();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
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
  }, [loaded, gameData, playerCharacter]);

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
