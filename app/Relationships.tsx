import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { Text, View, ScrollView } from "../components/Themed";
import { calculateAge } from "../utility/functions";
import { CharacterImage } from "../components/CharacterImage";
import { useSelector } from "react-redux";
import { selectGame, selectPlayerCharacter } from "../redux/selectors";

export default function RelationshipsScreen() {
  const playerCharacter = useSelector(selectPlayerCharacter);
  const gameData = useSelector(selectGame);

  if (playerCharacter) {
    const parents = playerCharacter.getParents();
    const dad = parents.find((parent) => parent.sex == "male");
    const mom = parents.find((parent) => parent.sex == "female");
    if (mom && dad && gameData) {
      const dadBDay = dad.birthdate;
      const momBDay = mom.birthdate;
      const currentDate = gameData.getGameDate();
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
                <Text className="text-xl">{dad?.getName()}</Text>
                <View className="mx-auto">
                  <Text className="flex flex-wrap text-center text-lg">
                    {dad?.getJobTitle()}
                  </Text>
                </View>
              </View>
              <View className="flex w-2/5 items-center">
                <Text className="text-2xl">Mom</Text>
                <View className="mx-auto">
                  <CharacterImage characterAge={momsAge} characterSex={"F"} />
                </View>
                <Text className="text-xl">{momsAge} Years Old</Text>
                <Text className="text-xl">{mom?.getName()}</Text>
                <View className="mx-auto">
                  <Text className="flex flex-wrap text-center text-lg">
                    {mom?.getJobTitle()}
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
