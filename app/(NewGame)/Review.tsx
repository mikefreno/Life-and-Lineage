import { Text } from "../../components/Themed";
import { Platform, View } from "react-native";
import {
  Character,
  PlayerCharacter,
  getStartingBook,
  savePlayer,
} from "../../entities/character";
import { useNavigation } from "expo-router";
import clearHistory, {
  getRandomName,
  toTitleCase,
  generateBirthday,
  wait,
} from "../../utility/functions/misc";
import { Game, saveGame } from "../../entities/game";
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
    const parent = new Character({
      firstName: firstName,
      lastName: lastName,
      sex: sex,
      job: job,
      affection: 85,
      birthdate: generateBirthday(32, 55),
    });
    return parent;
  }

  function createPlayerCharacter() {
    const mom = createParent("female");
    const dad = createParent("male");
    let newCharacter: PlayerCharacter;
    const bday = generateBirthday(15, 15);
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
        inCombat: false,
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
        inCombat: false,
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
        inCombat: false,
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
        inCombat: false,
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
      const player = createPlayerCharacter();
      const starterBook = getStartingBook(player);
      player.addToInventory(starterBook);
      const startDate = new Date().toISOString();
      const tutorialState = storage.getString("tutorialsEnabled");
      let parsed = true;
      if (tutorialState) {
        parsed = JSON.parse(tutorialState);
      }
      const newGame = new Game({
        date: startDate,
        vibrationEnabled: root.gameState?.vibrationEnabled
          ? root.gameState.vibrationEnabled
          : Platform.OS == "ios"
          ? "full"
          : "minimal",
        tutorialsEnabled: root.gameState
          ? root.gameState.tutorialsEnabled
          : parsed,
        tutorialsShown: root.gameState?.tutorialsShown,
        root,
      });
      const colorScheme = root.gameState?.colorScheme;
      if (colorScheme) {
        newGame.setColorScheme(colorScheme);
      }
      root.gameState = newGame;
      root.enemyStore.enemies = [];
      root.playerState = player;
      vibration({ style: "success" });
      wait(250).then(() => clearHistory(navigation));
      saveGame(newGame);
      savePlayer(player);
      storage.delete("tutorialsEnabled");
    }
  }

  if (blessingSelection && classSelection) {
    return (
      <View className="flex-1 px-6">
        <Text className="pt-[8vh] text-center text-2xl">Review</Text>
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
        <GenericFlatButton onPress={() => startGame()} className="mt-4">
          Confirm?
        </GenericFlatButton>
      </View>
    );
  }
}
