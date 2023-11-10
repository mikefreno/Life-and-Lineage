import { StatusBar } from "expo-status-bar";
import { Platform, ScrollView, Image } from "react-native";
import { Text, View } from "../components/Themed";
import { useContext } from "react";
import { GameContext, PlayerCharacterContext } from "./_layout";
import { calculateAge, getCharacterImage } from "../utility/functions";
import { CharacterImage } from "../components/CharacterImage";

export default function RelationshipsScreen() {
  const playerContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);

  if (!playerContext) {
    throw new Error(
      "RelationshipsScreen must be used within a PlayerCharacterContext provider",
    );
  }
  if (!gameContext) {
    throw new Error(
      "RelationshipsScreen must be used within a PlayerCharacterContext provider",
    );
  }

  const { gameData } = gameContext;
  const { playerCharacter } = playerContext;

  if (playerCharacter) {
    const parents = playerCharacter.getParents();
    const dad = parents.find((parent) => parent.getSex() == "male");
    const mom = parents.find((parent) => parent.getSex() == "female");
    if (mom && dad && gameData) {
      const dadBDay = dad.getBirthdate();
      const momBDay = mom.getBirthdate();
      const currentDate = gameData.getGameDate();
      const dadsAge = calculateAge(dadBDay, currentDate);
      const momsAge = calculateAge(momBDay, currentDate);

      return (
        <ScrollView className="pt-6">
          <Text className="py-12 text-center text-2xl">Parents</Text>
          <View className="flex flex-row justify-evenly">
            <View className="flex flex-col items-center">
              <Text className="text-2xl">Dad</Text>
              <View className="mx-auto">
                <CharacterImage characterAge={dadsAge} characterSex={"M"} />
              </View>
              <Text className="text-xl">{dadsAge} Years Old</Text>
              <Text className="text-xl">{dad?.getName()}</Text>
              <View className="mx-auto w-2/3">
                <Text className="flex flex-wrap text-center text-lg">
                  {dad?.getJobTitle()}
                </Text>
              </View>
            </View>
            <View className="flex flex-col items-center">
              <Text className="text-2xl">Mom</Text>
              <View className="mx-auto">
                <CharacterImage characterAge={momsAge} characterSex={"F"} />
              </View>
              <Text className="text-xl">{momsAge} Years Old</Text>
              <Text className="text-xl">{mom?.getName()}</Text>
              <View className="mx-auto w-2/3">
                <Text className="flex flex-wrap text-center text-lg">
                  {mom?.getJobTitle()}
                </Text>
              </View>
            </View>
          </View>

          {/* Use a light status bar on iOS to account for the black space above the modal */}
          <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        </ScrollView>
      );
    }
  }
}
