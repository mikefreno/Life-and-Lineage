import { useColorScheme } from "react-native";
import { View, Text } from "../../components/Themed";
import WizardHat from "../../assets/icons/WizardHatIcon";
import WitchHat from "../../assets/icons/WitchHatIcon";
import { calculateAge } from "../../utility/functions";
import Coins from "../../assets/icons/CoinsIcon";
import { useSelector } from "react-redux";
import { selectPlayerCharacter } from "../../redux/selectors";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const playerCharacter = useSelector(selectPlayerCharacter);

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

  const name = playerCharacter?.getName();
  const jobRes = playerCharacter?.getCurrentJobAndExperience();
  const elementalProficiencies = playerCharacter?.getElementalProficiencies();
  return (
    <View className="flex-1 justify-between px-4 py-6">
      <View className="flex flex-row pb-8">
        <View className="scale-x-[-1] transform">
          {playerCharacter?.sex == "male" ? (
            <WizardHat
              height={114}
              width={120}
              color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
            />
          ) : (
            <WitchHat
              height={120}
              width={120}
              color={colorScheme == "dark" ? "#7c3aed" : "#4c1d95"}
            />
          )}
        </View>
        <View className="my-auto flex flex-col pl-16">
          <Text className="text-xl dark:text-white">{`${name}`}</Text>
          <Text className="text-xl dark:text-white">{`${jobRes?.title}`}</Text>
          <Text className="text-xl dark:text-white">{`${
            playerCharacter
              ? calculateAge(playerCharacter.birthdate, new Date())
              : "x"
          } years old`}</Text>
        </View>
      </View>

      <View className="flex items-center">
        {elementalProficiencies
          ? elementalProficiencySection(elementalProficiencies)
          : null}
      </View>
      <View className="flex flex-col">
        <View className="flex flex-row justify-center">
          <Text>{playerCharacter?.getReadableGold()}</Text>
          <Coins width={20} height={20} style={{ marginLeft: 6 }} />
        </View>
        <View className="flex flex-row justify-evenly pt-12">
          <Text
            className="text-xl"
            style={{ color: "#ef4444" }}
          >{`${playerCharacter?.getHealth()} / ${playerCharacter?.getMaxHealth()} Health`}</Text>
          <Text
            className="text-xl"
            style={{ color: "#60a5fa" }}
          >{`${playerCharacter?.getMana()} / ${playerCharacter?.getMaxMana()} Mana`}</Text>
          <Text
            className="text-xl"
            style={{ color: "#c084fc" }}
          >{`${playerCharacter?.getSanity()} Sanity`}</Text>
        </View>
      </View>
    </View>
  );
}
