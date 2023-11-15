import { Pressable, StyleSheet } from "react-native";
import { View, Text, SafeAreaView } from "../components/Themed";
import { Stack } from "expo-router";
import deathMessages from "../assets/deathMessages.json";
import { useContext, useEffect, useState } from "react";
import { GameContext, PlayerCharacterContext } from "./_layout";
import { router } from "expo-router";
import { CharacterImage } from "../components/CharacterImage";
import { calculateAge } from "../utility/functions";
import { Character } from "../classes/character";
import { storeData } from "../store";

export default function DeathScreen() {
  const playerContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  const [nextLife, setNextLife] = useState<Character | null>(null);

  if (!playerContext || !gameContext) {
    throw new Error(
      "DeathScreen must be used within a PlayerCharacterContext, GameContext provider",
    );
  }
  function getDeathMessage() {
    const randomIndex = Math.floor(Math.random() * deathMessages.length);
    return deathMessages[randomIndex].message;
  }

  const { playerCharacter, setPlayerCharacter } = playerContext;
  const { gameData } = gameContext;

  useEffect(() => {
    gameData?.hitDeathScreen();
    storeData("game", gameData);
  }, []);

  function startNewGame() {
    router.replace("/NewGame");
  }

  const currentDate = gameData?.getGameDate();

  return (
    <SafeAreaView>
      <Stack.Screen
        options={{
          title: "You Died",
          headerShown: false,
        }}
      />
      <View className="flex h-full items-center justify-center">
        <Text className="text-3xl font-bold">{getDeathMessage()}</Text>
        {playerCharacter?.getChildren() ? (
          <>
            <Text className="text-xl">Continue as one of your children</Text>
            {playerCharacter.getChildren()?.map((child, idx) => (
              <Pressable key={idx} onPress={() => setNextLife(child)}>
                <CharacterImage
                  characterAge={calculateAge(
                    child.birthdate,
                    currentDate as Date,
                  )}
                  characterSex={child.sex == "male" ? "M" : "F"}
                />
              </Pressable>
            ))}
            {nextLife ? (
              <Pressable>
                <Text>{`Live on as ${nextLife.getName()}`}</Text>
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
