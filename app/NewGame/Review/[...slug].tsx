import { View as ThemedView, Text } from "../../../components/Themed";
import { Platform, Pressable } from "react-native";
import {
  Character,
  PlayerCharacter,
  getStartingBook,
} from "../../../classes/character";
import {
  Stack,
  router,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import clearHistory, {
  getRandomName,
  toTitleCase,
  generateBirthday,
  wait,
} from "../../../utility/functions/misc";
import { Game } from "../../../classes/game";
import { useContext, useEffect } from "react";
import { useVibration } from "../../../utility/customHooks";
import { getRandomJobTitle } from "../../../utility/functions/characterAid";
import { createShops } from "../../../classes/shop";
import { AppContext } from "../../_layout";
import {
  Element,
  ElementToString,
  PlayerClassOptions,
  isElement,
  isPlayerClassOptions,
} from "../../../utility/types";
import {
  elementalColorMap,
  playerClassColors,
} from "../../../constants/Colors";
import { storage } from "../../../utility/functions/storage";
import { useColorScheme } from "nativewind";
import { saveGame, savePlayer } from "../../../utility/functions/save_load";
import GenericFlatButton from "../../../components/GenericFlatButton";

export default function NewGameReview() {
  const { slug } = useLocalSearchParams();
  if (!slug) {
    return router.replace("/NewGame");
  }
  let playerClass: PlayerClassOptions;

  if (isPlayerClassOptions(slug[0])) {
    playerClass = slug[0];
  } else {
    return <Text>{`Invalid player class option: ${slug[0]}`}</Text>;
  }
  let blessing: Element;
  if (isElement(Number.parseInt(slug[1]))) {
    blessing = Number(slug[1]);
  } else {
    return <Text>{`Invalid player blessing option: ${slug[1]}`}</Text>;
  }
  const sex = slug[2];
  const firstName = slug[3];
  const lastName = slug[4];
  const vibration = useVibration();

  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("missing context");
  }
  const { gameState, setGameData, setPlayerCharacter, setLogs } = appData;
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

  function getStartingBaseStats({
    playerClass,
  }: {
    playerClass: PlayerClassOptions;
  }) {
    switch (playerClass) {
      case PlayerClassOptions.necromancer:
        return {
          baseHealth: 80,
          baseMana: 120,
          baseStrength: 3,
          baseIntelligence: 6,
          baseDexterity: 4,
          baseManaRegen: 6,
          baseSanity: 40,
        };
      case PlayerClassOptions.paladin:
        return {
          baseHealth: 120,
          baseMana: 80,
          baseStrength: 6,
          baseIntelligence: 4,
          baseDexterity: 3,
          baseManaRegen: 5,
          baseSanity: 60,
        };
      case PlayerClassOptions.mage:
        return {
          baseHealth: 100,
          baseMana: 100,
          baseStrength: 5,
          baseIntelligence: 5,
          baseDexterity: 3,
          baseManaRegen: 5,
          baseSanity: 50,
        };
      case PlayerClassOptions.ranger:
        return {
          baseHealth: 90,
          baseMana: 90,
          baseStrength: 4,
          baseIntelligence: 3,
          baseDexterity: 7,
          baseManaRegen: 5,
          baseSanity: 50,
        };
    }
  }

  function createPlayerCharacter() {
    const mom = createParent("female");
    const dad = createParent("male");
    let newCharacter: PlayerCharacter;
    const bday = generateBirthday(15, 15);
    if (
      playerClass === "paladin" &&
      (blessing == Element.vengeance ||
        blessing == Element.protection ||
        blessing == Element.holy)
    ) {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: playerClass,
        blessing: blessing,
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ playerClass }),
      });
    } else if (
      playerClass === "necromancer" &&
      (blessing == Element.bone ||
        blessing == Element.blood ||
        blessing == Element.summoning ||
        blessing == Element.pestilence)
    ) {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: playerClass,
        blessing: blessing,
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ playerClass }),
      });
    } else if (
      playerClass == "mage" &&
      (blessing == Element.air ||
        blessing == Element.fire ||
        blessing == Element.earth ||
        blessing == Element.water)
    ) {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: playerClass,
        blessing: blessing,
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ playerClass }),
      });
    } else if (
      playerClass == "ranger" &&
      (blessing == Element.beastMastery ||
        blessing == Element.assassination ||
        blessing == Element.arcane)
    ) {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: playerClass,
        blessing: blessing,
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ playerClass }),
      });
    } else {
      throw new Error("Incorrect Player class/blessing combination!");
    }
    return newCharacter;
  }

  async function startGame() {
    if (playerClass) {
      const player = createPlayerCharacter();
      const starterBook = getStartingBook(blessing);
      player.addToInventory(starterBook);
      const startDate = new Date().toISOString();
      const shops = createShops(playerClass);
      const tutorialState = storage.getString("tutorialsEnabled");
      let parsed = true;
      if (tutorialState) {
        parsed = JSON.parse(tutorialState);
      }
      const newGame = new Game({
        date: startDate,
        shops: shops,
        vibrationEnabled: gameState?.vibrationEnabled
          ? gameState.vibrationEnabled
          : Platform.OS == "ios"
          ? "full"
          : "minimal",
        tutorialsEnabled: gameState ? gameState.tutorialsEnabled : parsed,
        tutorialsShown: gameState?.tutorialsShown,
      });
      const colorScheme = gameState?.colorScheme;
      if (colorScheme) {
        newGame.setColorScheme(colorScheme);
      }
      setGameData(newGame);
      setPlayerCharacter(player);
      setLogs([]);
      vibration({ style: "success" });
      wait(250).then(() => clearHistory(navigation));
      saveGame(newGame);
      savePlayer(player);
      storage.delete("tutorialsEnabled");
    }
  }

  return (
    <ThemedView className="flex-1 px-6">
      <Stack.Screen
        options={{
          title: "Review",
          headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          headerBackTitleStyle: { fontFamily: "PixelifySans" },
        }}
      />
      <Text className="pt-[8vh] text-center text-2xl">Review</Text>
      <Text className="pt-[16vh] text-center text-3xl">
        {`${firstName} ${lastName} the `}
        <Text
          style={{
            color:
              blessing == Element.assassination && colorScheme == "dark"
                ? elementalColorMap[blessing].light
                : elementalColorMap[blessing].dark,
          }}
        >{`${ElementToString[blessing]}`}</Text>
        -born{" "}
        <Text style={{ color: playerClassColors[playerClass] }}>{`${toTitleCase(
          playerClass,
        )}`}</Text>
      </Text>
      <GenericFlatButton onPressFunction={() => startGame()} className="mt-4">
        Confirm?
      </GenericFlatButton>
    </ThemedView>
  );
}
