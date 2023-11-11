import { ScrollView, Text } from "react-native";
import { View } from "../../components/Themed";
import { useContext } from "react";
import { PlayerCharacterContext } from "../_layout";
import WizardHat from "../../assets/icons/WizardHatIcon";
import WitchHat from "../../assets/icons/WitchHatIcon";
import { calculateAge } from "../../utility/functions";

export default function HomeScreen() {
  const playerContext = useContext(PlayerCharacterContext);

  if (!playerContext) {
    throw new Error(
      "NewGameScreen must be used within a PlayerCharacterContext provider",
    );
  }

  function elementalProficiencySection(
    proficiencies: {
      element: string;
      proficiency: number;
    }[],
  ) {
    return proficiencies.map((elementalProficiency, idx) => {
      return (
        <Text className="text-lg dark:text-white" key={idx}>
          {elementalProficiency.element}: {elementalProficiency.proficiency} /
          500
        </Text>
      );
    });
  }

  const { playerCharacter } = playerContext;
  if (playerCharacter) {
    const name = playerCharacter.getName();
    const { title, experience } = playerCharacter.getCurrentJobAndExperience();
    const elementalProficiencies = playerCharacter.getElementalProficiencies();

    return (
      <ScrollView className="px-4 py-6">
        <View className="flex flex-row">
          {playerCharacter?.sex == "male" ? (
            <WizardHat height={114} width={120} color={"#1e40af"} />
          ) : (
            <WitchHat height={120} width={120} color={"#4c1d95"} />
          )}
          <View className="my-auto flex flex-col pl-16">
            <Text className="text-xl dark:text-white">{`${name}`}</Text>
            <Text className="text-xl dark:text-white">{`${title}`}</Text>
            <Text className="text-xl dark:text-white">{`${calculateAge(
              playerCharacter.birthdate,
              new Date(),
            )} years old`}</Text>
          </View>
        </View>
        <View>{elementalProficiencySection(elementalProficiencies)}</View>
      </ScrollView>
    );
  }
}
