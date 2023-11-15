import { useContext } from "react";
import { View as ThemedView, Text } from "../../../components/Themed";
import { Pressable, View } from "react-native";
import {
  BattleLogContext,
  DungeonMonsterContext,
  GameContext,
  PlayerCharacterContext,
} from "../../_layout";
import { Character, PlayerCharacter } from "../../../classes/character";
import { Stack, router, useLocalSearchParams } from "expo-router";
import names from "../../../assets/names.json";
import jobs from "../../../assets/jobs.json";
import { saveGame } from "../../../utility/functions";
import { Game } from "../../../classes/game";

export default function NewGameReview() {
  const gameContext = useContext(GameContext);
  const playerContext = useContext(PlayerCharacterContext);
  const dungeonMonsterContext = useContext(DungeonMonsterContext);
  const battleLogContext = useContext(BattleLogContext);
  const { slug } = useLocalSearchParams();
  const witchOrWizard = slug[0];
  const firstName = slug[1];
  const lastName = slug[2];
  const star = slug[3];
  const element = slug[4];

  if (
    !gameContext ||
    !playerContext ||
    !battleLogContext ||
    !dungeonMonsterContext
  ) {
    throw new Error("NewGameScreen must be used within a GameContext provider");
  }

  const { setGameData } = gameContext;
  const { setPlayerCharacter } = playerContext;
  const { setLogs } = battleLogContext;
  const { setMonster } = dungeonMonsterContext;

  function generateBirthdate(zodiac: string, birthYear: number): Date {
    let month: number;
    let day: number;

    switch (zodiac) {
      case "aquarius":
        month = Math.random() < 0.5 ? 0 : 1;
        day = month === 0 ? randomDay(20, 31) : randomDay(1, 18);
        break;
      case "pisces":
        month = Math.random() < 0.5 ? 1 : 2;
        day = month === 1 ? randomDay(19, 29) : randomDay(1, 20);
        break;
      case "aries":
        month = Math.random() < 0.5 ? 2 : 3;
        day = month === 2 ? randomDay(21, 31) : randomDay(1, 19);
        break;
      case "taurus":
        month = Math.random() < 0.5 ? 3 : 4;
        day = month === 3 ? randomDay(20, 30) : randomDay(1, 20);
        break;
      case "gemini":
        month = Math.random() < 0.5 ? 4 : 5;
        day = month === 4 ? randomDay(21, 31) : randomDay(1, 20);
        break;
      case "cancer":
        month = Math.random() < 0.5 ? 5 : 6;
        day = month === 5 ? randomDay(21, 30) : randomDay(1, 22);
        break;
      case "leo":
        month = Math.random() < 0.5 ? 6 : 7;
        day = month === 6 ? randomDay(23, 31) : randomDay(1, 22);
        break;
      case "virgo":
        month = Math.random() < 0.5 ? 7 : 8;
        day = month === 7 ? randomDay(23, 31) : randomDay(1, 22);
        break;
      case "libra":
        month = Math.random() < 0.5 ? 8 : 9;
        day = month === 8 ? randomDay(23, 30) : randomDay(1, 22);
        break;
      case "scorpio":
        month = Math.random() < 0.5 ? 9 : 10;
        day = month === 9 ? randomDay(23, 31) : randomDay(1, 21);
        break;
      case "sagittarius":
        month = Math.random() < 0.5 ? 10 : 11;
        day = month === 10 ? randomDay(22, 30) : randomDay(1, 21);
        break;
      case "capricorn":
        month = Math.random() < 0.5 ? 11 : 0;
        day = month === 11 ? randomDay(22, 31) : randomDay(1, 19);
        break;
      default:
        throw new Error("Invalid zodiac sign");
    }

    return new Date(birthYear, month, day);
  }

  // Helper function to get a random day in a range
  function randomDay(from: number, to: number): number {
    return Math.floor(Math.random() * (to - from + 1) + from);
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
    const age = Math.floor(Math.random() * (55 - 32) + 32);
    const birthYear = new Date().getFullYear() - age;
    const birthday = generateBirthdate(generateRandomZodiac(), birthYear);
    const firstName = getRandomFirstName(sex);
    const job = getRandomJobTitle();
    const parent = new Character({
      firstName: firstName,
      lastName: lastName,
      sex: sex,
      birthdate: birthday,
      job: job,
      affection: 75,
    });
    return parent;
  }

  function generateRandomZodiac(): string {
    const zodiacSigns = [
      "aquarius",
      "pisces",
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
    ];

    const randomIndex = Math.floor(Math.random() * zodiacSigns.length);

    return zodiacSigns[randomIndex];
  }

  function createPlayerCharacter() {
    const birthYear = new Date().getFullYear() - 15;
    const birthdate = generateBirthdate(star, birthYear);
    const mom = createParent("female");
    const dad = createParent("male");
    const newCharacter = new PlayerCharacter({
      firstName: firstName,
      lastName: lastName,
      sex: witchOrWizard == "Witch" ? "female" : "male",
      birthdate: birthdate,
      element: element,
      parents: [mom, dad],
    });
    return newCharacter;
  }

  function startGame() {
    const player = createPlayerCharacter();
    setPlayerCharacter(player);
    const startDate = new Date();
    const newGame = new Game({ date: startDate, player: player });
    setGameData(newGame);
    saveGame(newGame);
    setLogs([]);
    setMonster(null);

    router.back();
    router.back();
    router.back();
    router.back();
    router.replace("/");
  }

  return (
    <ThemedView className="flex-1 px-6">
      <Stack.Screen
        options={{
          title: "Review",
        }}
      />
      <Text className="pt-12 text-center text-2xl">Review</Text>
      <Text className="pt-24 text-center text-3xl">{`${firstName} ${lastName} the ${element} (${star}) ${witchOrWizard}`}</Text>
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
