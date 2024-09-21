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
import {
  getRandomName,
  toTitleCase,
} from "../../../utility/functions/misc/words";
import { Game } from "../../../classes/game";
import { useContext } from "react";
import { useVibration } from "../../../utility/customHooks";
import { getRandomJobTitle } from "../../../utility/functions/characterAid";
import { createShops } from "../../../classes/shop";
import { generateBirthday } from "../../../utility/functions/misc/age";
import clearHistory from "../../../utility/functions/misc/nav";
import { fullSave, storage } from "../../../utility/functions/save_load";
import { AppContext } from "../../_layout";
import {
  Element,
  PlayerClassOptions,
  isElement,
  isPlayerClassOptions,
} from "../../../utility/types";
import {
  elementalColorMap,
  playerClassColors,
} from "../../../utility/elementColors";

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
  if (isElement(slug[1])) {
    blessing = slug[1];
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
    playerClass: "necromancer" | "paladin" | "mage" | "ranger";
  }) {
    switch (playerClass) {
      case "necromancer":
        return {
          baseHealth: 80,
          baseMana: 120,
          baseStrength: 3,
          baseIntelligence: 6,
          baseDexterity: 4,
          baseManaRegen: 6,
          baseSanity: 40,
        };
      case "paladin":
        return {
          baseHealth: 120,
          baseMana: 80,
          baseStrength: 6,
          baseIntelligence: 4,
          baseDexterity: 3,
          baseManaRegen: 5,
          baseSanity: 60,
        };
      case "mage":
        return {
          baseHealth: 100,
          baseMana: 100,
          baseStrength: 5,
          baseIntelligence: 5,
          baseDexterity: 3,
          baseManaRegen: 5,
          baseSanity: 50,
        };
      case "ranger":
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
    if (playerClass === "paladin") {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: playerClass as "paladin",
        blessing: blessing as "holy" | "vengeance" | "protection",
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ playerClass }),
      });
    } else if (playerClass === "necromancer") {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: playerClass as "necromancer",
        blessing: blessing as "blood" | "summoning" | "pestilence" | "bone",
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ playerClass }),
      });
    } else if (playerClass == "mage") {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: playerClass as "mage",
        blessing: blessing as "fire" | "water" | "air" | "earth",
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ playerClass: "mage" }),
      });
    } else {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        playerClass: playerClass as "ranger",
        blessing: blessing as "beastMastery" | "assassination" | "arcane",
        parents: [mom, dad],
        birthdate: bday,
        ...getStartingBaseStats({ playerClass: "ranger" }),
      });
    }
    return newCharacter;
  }

  async function startGame() {
    if (
      playerClass == "mage" ||
      playerClass == "paladin" ||
      playerClass == "necromancer" ||
      playerClass == "ranger"
    ) {
      const player = createPlayerCharacter();
      const starterBook = getStartingBook(Element[blessing]);
      player.addToInventory(starterBook);
      const startDate = new Date().toISOString();
      const shops = createShops(
        playerClass as "mage" | "paladin" | "necromancer" | "ranger",
      );
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
      setTimeout(() => clearHistory(navigation), 500);
      fullSave(newGame, player);
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
          style={{ color: elementalColorMap[blessing as Element].dark }}
        >{`${
          blessing == "beastMastery" ? "Beast Mastery" : toTitleCase(blessing)
        }`}</Text>
        -born{" "}
        <Text style={{ color: playerClassColors[playerClass] }}>{`${toTitleCase(
          playerClass,
        )}`}</Text>
      </Text>
      <Pressable
        onPress={() => startGame()}
        className="mx-auto mt-[6vh] rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
      >
        <Text className="text-xl tracking-widest">Confirm?</Text>
      </Pressable>
    </ThemedView>
  );
}
