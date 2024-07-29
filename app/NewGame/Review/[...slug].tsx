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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRandomJobTitle } from "../../../utility/functions/characterAid";
import { createShops } from "../../../classes/shop";
import { generateBirthday } from "../../../utility/functions/misc/age";
import clearHistory from "../../../utility/functions/misc/nav";
import { fullSave } from "../../../utility/functions/save_load";
import { AppContext } from "../../_layout";

export default function NewGameReview() {
  const { slug } = useLocalSearchParams();
  if (!slug) {
    return router.replace("/NewGame");
  }
  const playerClass = slug[0];
  const blessing = slug[1];
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
      sexuality: "straight",
      affection: 85,
      birthdate: generateBirthday(32, 55),
      deathdate: null,
    });
    return parent;
  }

  function createPlayerCharacter() {
    const mom = createParent("female");
    const dad = createParent("male");
    let newCharacter: PlayerCharacter;
    const bday = generateBirthday(15, 18);
    if (playerClass === "paladin") {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        sexuality: null,
        playerClass: playerClass as "paladin",
        blessing: blessing as "holy" | "vengeance" | "protection",
        parents: [mom, dad],
        birthdate: bday,
        deathdate: null,
      });
    } else if (playerClass === "necromancer") {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        sexuality: null,
        playerClass: playerClass as "necromancer",
        blessing: blessing as "blood" | "summoning" | "pestilence" | "bone",
        parents: [mom, dad],
        birthdate: bday,
        deathdate: null,
      });
    } else {
      newCharacter = new PlayerCharacter({
        firstName: firstName,
        lastName: lastName,
        sex: sex as "male" | "female",
        sexuality: null,
        playerClass: playerClass as "mage",
        blessing: blessing as "fire" | "water" | "air" | "earth",
        parents: [mom, dad],
        birthdate: bday,
        deathdate: null,
      });
    }
    return newCharacter;
  }

  async function startGame() {
    if (
      playerClass == "mage" ||
      playerClass == "paladin" ||
      playerClass == "necromancer"
    ) {
      const player = createPlayerCharacter();
      const starterBook = getStartingBook(
        blessing as
          | "fire"
          | "water"
          | "air"
          | "earth"
          | "blood"
          | "summoning"
          | "pestilence"
          | "bone"
          | "holy"
          | "vengeance"
          | "protection",
      );
      player.addToInventory(starterBook);
      const startDate = new Date().toISOString();
      const shops = createShops(
        playerClass as "mage" | "paladin" | "necromancer",
      );
      const tutorialState = await AsyncStorage.getItem("tutorialsEnabled");
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
      AsyncStorage.removeItem("tutorialsEnabled");
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
      <Text className="pt-[16vh] text-center text-3xl">{`${firstName} ${lastName} the ${toTitleCase(
        blessing,
      )}-born ${toTitleCase(playerClass)}`}</Text>
      <Pressable
        onPress={() => startGame()}
        className="mx-auto mt-[6vh] rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
      >
        <Text className="text-xl tracking-widest">Confirm?</Text>
      </Pressable>
    </ThemedView>
  );
}
