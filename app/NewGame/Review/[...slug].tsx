import { View as ThemedView, Text } from "../../../components/Themed";
import { Pressable, View } from "react-native";
import {
  Character,
  PlayerCharacter,
  getStartingBook,
} from "../../../classes/character";
import { Stack, router, useLocalSearchParams } from "expo-router";
import names from "../../../assets/json/names.json";
import jobs from "../../../assets/json/jobs.json";
import {
  createShops,
  fullSave,
  generateBirthday,
  toTitleCase,
} from "../../../utility/functions";
import { Game } from "../../../classes/game";
import { useContext } from "react";
import {
  GameContext,
  LogsContext,
  MonsterContext,
  PlayerCharacterContext,
} from "../../_layout";

export default function NewGameReview() {
  const { slug } = useLocalSearchParams();
  const playerClass = slug[0];
  const sex = slug[1];
  const firstName = slug[2];
  const lastName = slug[3];
  const blessing = slug[4];

  const playerCharacterSetter = useContext(PlayerCharacterContext)
    ?.setPlayerCharacter;
  const gameDataSetter = useContext(GameContext)?.setGameData;
  const monsterSetter = useContext(MonsterContext)?.setMonster;
  const logsSetter = useContext(LogsContext)?.setLogs;
  if (
    !playerCharacterSetter ||
    !monsterSetter ||
    !gameDataSetter ||
    !logsSetter
  ) {
    throw new Error("missing context setters");
  }

  function getRandomJobTitle(): string {
    const randomIndex = Math.floor(Math.random() * jobs.length);
    return jobs[randomIndex].title;
  }
  function getRandomFirstName(sex: string): string {
    const filteredNames = names.filter((name) => {
      return name.sex == sex;
    });
    const randomIndex = Math.floor(Math.random() * filteredNames.length);
    return filteredNames[randomIndex].firstName;
  }

  function createParent(sex: "female" | "male"): Character {
    const firstName = getRandomFirstName(sex);
    const job = getRandomJobTitle();
    const parent = new Character({
      firstName: firstName,
      lastName: lastName,
      sex: sex,
      job: job,
      affection: 75,
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
      playerCharacterSetter &&
      gameDataSetter &&
      monsterSetter &&
      logsSetter &&
      (playerClass == "mage" ||
        playerClass == "paladin" ||
        playerClass == "necromancer")
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
      playerCharacterSetter(player);
      const startDate = new Date().toISOString();
      const shops = createShops(
        playerClass as "mage" | "paladin" | "necromancer",
      );
      const newGame = new Game({ date: startDate, shops: shops });
      gameDataSetter(newGame);
      logsSetter([]);
      monsterSetter(null);
      await fullSave(newGame, player);

      try {
        router.back();
        router.back();
        router.back();
        router.back();
      } catch (e) {
        console.log(e);
      }
      router.replace("/");
    }
  }

  return (
    <ThemedView className="flex-1 px-6">
      <Stack.Screen
        options={{
          title: "Review",
        }}
      />
      <Text className="pt-12 text-center text-2xl">Review</Text>
      <Text className="pt-24 text-center text-3xl">{`${firstName} ${lastName} the ${toTitleCase(
        blessing,
      )}-born ${toTitleCase(playerClass)}`}</Text>
      <Pressable className="mx-auto pt-8" onPress={() => startGame()}>
        {({ pressed }) => (
          <View
            className={`rounded-lg bg-blue-400 px-8 py-4 dark:bg-blue-800 ${
              pressed ? "scale-95 opacity-30" : null
            }`}
          >
            <Text style={{ color: "white" }} className="text-2xl">
              Confirm?
            </Text>
          </View>
        )}
      </Pressable>
    </ThemedView>
  );
}
