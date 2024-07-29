import { Pressable } from "react-native";
import { View, Text, SafeAreaView } from "../components/Themed";
import { Stack } from "expo-router";
import deathMessages from "../assets/json/deathMessages.json";
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { CharacterImage } from "../components/CharacterImage";
import { calculateAge } from "../utility/functions/misc/age";
import { Character } from "../classes/character";
import { AppContext } from "./_layout";
import GenericStrikeAround from "../components/GenericStrikeAround";

export default function DeathScreen() {
  const [nextLife, setNextLife] = useState<Character | null>(null);

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing contexts");
  const { playerState, gameState } = appData;

  function getDeathMessage() {
    const randomIndex = Math.floor(Math.random() * deathMessages.length);
    return deathMessages[randomIndex].message;
  }

  useEffect(() => {
    if (gameState) {
      gameState.hitDeathScreen();
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
            {playerState.sanity > -50
              ? getDeathMessage()
              : "You have gone insane"}
          </Text>
          {playerState.children.length > 0 ? (
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
              <GenericStrikeAround>
                <Text>Or</Text>
              </GenericStrikeAround>
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
