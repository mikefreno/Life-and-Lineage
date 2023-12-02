import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { Text, View, ScrollView } from "../components/Themed";
import { calculateAge } from "../utility/functions";
import { CharacterImage } from "../components/CharacterImage";
import { useContext } from "react";
import { GameContext, PlayerCharacterContext } from "./_layout";

export default function RelationshipsScreen() {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const playerCharacter = playerCharacterData?.playerState;
  const gameData = useContext(GameContext);
  const game = gameData?.gameState;

  if (playerCharacter) {
    const parents = playerCharacter.parents;
    const dad = parents.find((parent) => parent.sex == "male");
    const mom = parents.find((parent) => parent.sex == "female");
    if (mom && dad && game) {
      const dadBDay = new Date(dad.birthdate);
      const momBDay = new Date(mom.birthdate);
      const currentDate = new Date(game.date);
      const dadsAge = calculateAge(dadBDay, currentDate);
      const momsAge = calculateAge(momBDay, currentDate);

      return (
        <ScrollView>
          <View className="flex-1 items-center pt-6">
            <Text className="py-12 text-center text-2xl">Parents</Text>
            <View className="flex flex-row">
              <View className="flex w-2/5 items-center">
                <Text className="text-2xl">Dad</Text>
                <View className="mx-auto">
                  <CharacterImage characterAge={dadsAge} characterSex={"M"} />
                </View>
                <Text className="text-xl">{dadsAge} Years Old</Text>
                <Text className="text-xl">{dad?.getFullName()}</Text>
                <View className="mx-auto">
                  <Text className="flex flex-wrap text-center text-lg">
                    {dad?.job}
                  </Text>
                </View>
              </View>
              <View className="flex w-2/5 items-center">
                <Text className="text-2xl">Mom</Text>
                <View className="mx-auto">
                  <CharacterImage characterAge={momsAge} characterSex={"F"} />
                </View>
                <Text className="text-xl">{momsAge} Years Old</Text>
                <Text className="text-xl">{mom?.getFullName()}</Text>
                <View className="mx-auto">
                  <Text className="flex flex-wrap text-center text-lg">
                    {mom?.job}
                  </Text>
                </View>
              </View>
            </View>

            {/* Use a light status bar on iOS to account for the black space above the modal */}
            <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
          </View>
        </ScrollView>
      );
    }
  }
}
