import { Pressable, SafeAreaView } from "react-native";
import { View, Text } from "../components/Themed";
import { Stack } from "expo-router";
import deathMessages from "../assets/deathMessages.json";
import { useContext } from "react";
import { PlayerCharacter } from "../classes/character";
import { PlayerCharacterContext } from "./_layout";
import { router } from "expo-router";

export default function DeathScreen() {
  const playerContext = useContext(PlayerCharacterContext);

  if (playerContext) {
    function getDeathMessage() {
      const randomIndex = Math.floor(Math.random() * deathMessages.length);
      return deathMessages[randomIndex].message;
    }

    const { playerCharacter, setPlayerCharacter } = playerContext;

    function startNewGame() {
      setPlayerCharacter(undefined);
      router.push("/NewGame");
    }

    return (
      <SafeAreaView>
        <Stack.Screen
          options={{
            title: "You Died",
            headerShown: false,
          }}
        />
        <View className="flex h-full items-center">
          <Text className="text-center text-3xl font-bold">
            {getDeathMessage()}
          </Text>

          <Pressable onPress={startNewGame}>
            <Text>Live a New Life</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}
