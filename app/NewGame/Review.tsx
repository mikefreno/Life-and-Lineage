import { Text } from "../../components/Themed";
import { View } from "react-native";
import { Character, PlayerCharacter } from "../../entities/character";
import { useNavigation } from "expo-router";
import clearHistory, {
  getRandomName,
  getRandomPersonality,
  toTitleCase,
  wait,
} from "../../utility/functions/misc";
import {
  getRandomJobTitle,
  getStartingBaseStats,
} from "../../utility/functions/characterAid";
import { Element, ElementToString } from "../../utility/types";
import { elementalColorMap, playerClassColors } from "../../constants/Colors";
import { storage } from "../../utility/functions/storage";
import { useColorScheme } from "nativewind";
import GenericFlatButton from "../../components/GenericFlatButton";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { useNewGameStore } from "./_layout";

export default function NewGameReview() {
  const { firstName, lastName, blessingSelection, sex, classSelection } =
    useNewGameStore();

  const vibration = useVibration();

  let root = useRootStore();
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();

  function createParent(sex: "female" | "male"): Character {
    const firstName = getRandomName(sex).firstName;
    const job = getRandomJobTitle();
    const personality = getRandomPersonality();
    const parent = new Character({
      firstName: firstName,
      lastName: lastName,
      personality,
      sex: sex,
      job: job,
      affection: 85,
      birthdate: root.time.generateBirthDateInRange(32, 55),
      root,
    });
    return parent;
  }

  function createPlayerCharacter() {
    const mom = createParent("female");
    const dad = createParent("male");
    let newCharacter: PlayerCharacter;
    const bday = root.time.generateBirthDateForAge(15);
    if (
      classSelection === "paladin" &&
      (blessingSelection == Element.vengeance ||
        blessingSelection == Element.protection ||
        blessingSelection == Element.holy)
    ) {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: classSelection,
        blessing: blessingSelection,
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ classSelection }),
        root,
      });
    } else if (
      classSelection === "necromancer" &&
      (blessingSelection == Element.bone ||
        blessingSelection == Element.blood ||
        blessingSelection == Element.summoning ||
        blessingSelection == Element.pestilence)
    ) {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: classSelection,
        blessing: blessingSelection,
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ classSelection }),
        root,
      });
    } else if (
      classSelection == "mage" &&
      (blessingSelection == Element.air ||
        blessingSelection == Element.fire ||
        blessingSelection == Element.earth ||
        blessingSelection == Element.water)
    ) {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: classSelection,
        blessing: blessingSelection,
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ classSelection }),
        root,
      });
    } else if (
      classSelection == "ranger" &&
      (blessingSelection == Element.beastMastery ||
        blessingSelection == Element.assassination ||
        blessingSelection == Element.arcane)
    ) {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: classSelection,
        blessing: blessingSelection,
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ classSelection }),
        root,
      });
    } else {
      throw new Error("Incorrect Player class/blessing combination!");
    }
    return newCharacter;
  }

  async function startGame() {
    if (classSelection) {
      let parsed = true;
      const tutorialState = storage.getString("tutorialsEnabled");
      if (tutorialState) {
        parsed = JSON.parse(tutorialState);
      }
      const player = createPlayerCharacter();
      root.newGame(player);
      vibration({ style: "success" });
      wait(250).then(() => clearHistory(navigation));
    }
  }

  if (blessingSelection !== undefined && classSelection !== undefined) {
    return (
      <View className="flex-1 px-6">
        <Text
          className="pt-[8vh] text-center text-2xl"
          accessibilityRole="header"
        >
          Review
        </Text>
        <Text className="pt-[16vh] text-center text-3xl">
          {`${firstName} ${lastName} the `}
          <Text
            style={{
              color:
                blessingSelection == Element.assassination &&
                colorScheme == "dark"
                  ? elementalColorMap[blessingSelection].light
                  : elementalColorMap[blessingSelection].dark,
            }}
          >{`${ElementToString[blessingSelection]}`}</Text>
          -born{" "}
          <Text
            style={{ color: playerClassColors[classSelection] }}
          >{`${toTitleCase(classSelection)}`}</Text>
        </Text>
        <GenericFlatButton
          onPress={() => startGame()}
          className="mt-4"
          accessibilityRole="button"
          accessibilityLabel="Confirm"
        >
          Confirm?
        </GenericFlatButton>
      </View>
    );
  }
}
