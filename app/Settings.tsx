import { StatusBar } from "expo-status-bar";
import { Platform, Pressable, StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { router } from "expo-router";

export default function SettingsScreen() {
  const fastStart = () => {
    router.back();
    router.push("/NewGame/Review/necromancer/male/Vim/God/blood");
  };

  const startNewGame = () => {
    router.back();
    router.push("/NewGame");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <View>
        <Pressable
          onPress={startNewGame}
          className="px-4 py-6 active:bg-zinc-200 active:dark:bg-zinc-700"
        >
          <Text className="text-center">Start New Game</Text>
        </Pressable>
        <Pressable
          onPress={fastStart}
          className="px-4 py-6 active:bg-zinc-200 active:dark:bg-zinc-700"
        >
          <Text className="text-center">Fast Start</Text>
        </Pressable>
      </View>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
