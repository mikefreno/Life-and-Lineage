import { StatusBar } from "expo-status-bar";
import { Platform, Pressable } from "react-native";
import { Text, View } from "../../components/Themed";
import { router } from "expo-router";

export default function SettingsScreen() {
  const fastStart = () => {
    router.push("/NewGame/Review/necromancer/male/Vim/God/summoning");
  };

  const startNewGame = () => {
    router.push("/NewGame");
  };

  return (
    <View className="flex-1 px-4 py-6">
      <View className="flex">
        <Pressable
          onPress={startNewGame}
          className="mx-auto my-4 rounded border border-zinc-800 px-4 py-6 active:scale-95 active:bg-zinc-200 active:opacity-50 dark:border-zinc-50 active:dark:bg-zinc-700"
        >
          <Text className="text-center">Start New Game</Text>
        </Pressable>
        <Pressable
          onPress={fastStart}
          className="mx-auto my-4 rounded border border-zinc-800 px-4 py-6 active:scale-95 active:bg-zinc-200 active:opacity-50 dark:border-zinc-50 active:dark:bg-zinc-700"
        >
          <Text className="text-center">Fast Start</Text>
        </Pressable>
      </View>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
