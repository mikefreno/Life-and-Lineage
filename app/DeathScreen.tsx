import { Pressable, StyleSheet } from "react-native";
import { View, Text, SafeAreaView } from "../components/Themed";
import { Stack } from "expo-router";
import deathMessages from "../assets/json/deathMessages.json";
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { CharacterImage } from "../components/CharacterImage";
import { calculateAge } from "../utility/functions";
import { Character } from "../classes/character";
import { GameContext, PlayerCharacterContext } from "./_layout";

export default function DeathScreen() {
  const [nextLife, setNextLife] = useState<Character | null>(null);

  const gameData = useContext(GameContext);
  const playerCharacterData = useContext(PlayerCharacterContext);
  if (!gameData || !playerCharacterData) throw new Error("missing contexts");
  const { gameState } = gameData;
  const { playerState } = playerCharacterData;

  function getDeathMessage() {
    const randomIndex = Math.floor(Math.random() * deathMessages.length);
    return deathMessages[randomIndex].message;
  }

  useEffect(() => {
    if (gameState) {
      gameState.atDeathScreen = true;
    }
  }, []);

  function startNewGame() {
    router.push("/NewGame");
  }

  if (gameState && playerState) {
    return (
      <SafeAreaView>
        <Stack.Screen
          options={{
            title: "You Died",
            headerShown: false,
          }}
        />
        <View className="flex h-full items-center justify-center">
          <Text
            className="py-8 text-center text-3xl font-bold"
            style={{ letterSpacing: 3, color: "#ef4444" }}
          >
            {getDeathMessage()}
          </Text>
          {playerState.children ? (
            <>
              <Text className="text-xl">Continue as one of your children</Text>
              {playerState.children?.map((child, idx) => (
                <Pressable key={idx} onPress={() => setNextLife(child)}>
                  <CharacterImage
                    characterAge={calculateAge(
                      new Date(child.birthdate),
                      new Date(gameState.date),
                    )}
                    characterSex={child.sex == "male" ? "M" : "F"}
                  />
                </Pressable>
              ))}
              {nextLife ? (
                <Pressable>
                  <Text>{`Live on as ${nextLife.getFullName()}`}</Text>
                </Pressable>
              ) : null}
              <View style={styles.container}>
                <View style={styles.line} />
                <View style={styles.content}>
                  <Text>Or</Text>
                </View>
                <View style={styles.line} />
              </View>
            </>
          ) : null}
          <Pressable
            onPress={startNewGame}
            className="mt-2 border px-4 py-2 active:scale-95 active:bg-zinc-100 dark:border-zinc-50 active:dark:bg-zinc-600"
          >
            <Text className="text-lg">Live a New Life</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
