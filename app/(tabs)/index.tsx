import { useColorScheme } from "react-native";
import { View, Text } from "../../components/Themed";
import WizardHat from "../../assets/icons/WizardHatIcon";
import WitchHat from "../../assets/icons/WitchHatIcon";
import { calculateAge } from "../../utility/functions";
import Coins from "../../assets/icons/CoinsIcon";
import { useSelector } from "react-redux";
import { selectPlayerCharacter } from "../../redux/selectors";
import ProgressBar from "../../components/ProgressBar";
import PlayerStatus from "../../components/PlayerStatus";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const playerCharacter = useSelector(selectPlayerCharacter);

  const elementalColorMap = {
    fire: { filledColor: "#f87171", unfilledColor: "#fef2f2" },
    earth: { filledColor: "#937D62", unfilledColor: "#DFDCC7" },
    air: { filledColor: "#d4d4d8", unfilledColor: "#f8fafc" },
    water: { filledColor: "#60a5fa", unfilledColor: "#eff6ff" },
  };

  function elementalProficiencySection(
    proficiencies: {
      element: string;
      proficiency: number;
    }[],
  ) {
    return proficiencies.map((elementalProficiency, idx) => {
      const color =
        elementalColorMap[
          elementalProficiency.element as "fire" | "earth" | "air" | "water"
        ];
      return (
        <View className="my-4 flex w-full flex-col" key={idx}>
          <Text
            className="mx-auto"
            style={{
              color:
                elementalProficiency.element == "air" && colorScheme == "light"
                  ? "#71717a"
                  : color.filledColor,
            }}
          >
            {elementalProficiency.element}
          </Text>
          <ProgressBar
            value={elementalProficiency.proficiency}
            maxValue={500}
            unfilledColor={color.unfilledColor}
            filledColor={color.filledColor}
            borderColor={color.filledColor}
          />
        </View>
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
      {playerCharacter ? (
        <View className="flex flex-col">
          <View className="flex flex-row justify-center">
            <Text>{playerCharacter.getReadableGold()}</Text>
            <Coins width={20} height={20} style={{ marginLeft: 6 }} />
          </View>
          <PlayerStatus />
        </View>
      ) : null}
    </View>
  );
}
