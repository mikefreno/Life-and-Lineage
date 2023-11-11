import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  useColorScheme,
} from "react-native";
import { Text, View } from "../components/Themed";
import "../assets/styles/globals.css";
import { useContext, useState } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import WitchHat from "../assets/icons/WitchHatIcon";
import WizardHat from "../assets/icons/WizardHatIcon";
import { Character, PlayerCharacter } from "../classes/character";
import jobs from "../assets/jobs.json";
import names from "../assets/names.json";
import { Game } from "../classes/game";
import { GameContext, PlayerCharacterContext } from "./_layout";
import { Stack, router } from "expo-router";
import { storeData } from "../store";

export default function NewGameScreen() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [witchOrWizard, setWitchOrWizard] = useState<string>("");
  const [characterCreationStep, setCharacterCreationStep] = useState<number>(0);
  const [star, setStar] = useState<string>("");
  const [element, setElement] = useState<string>("");

  const colorScheme = useColorScheme();

  const gameContext = useContext(GameContext);
  const playerContext = useContext(PlayerCharacterContext);

  if (!gameContext) {
    throw new Error("NewGameScreen must be used within a GameContext provider");
  }
  if (!playerContext) {
    throw new Error(
      "NewGameScreen must be used within a PlayerCharacterContext provider",
    );
  }

  const { setGameData } = gameContext;
  const { setPlayerCharacter } = playerContext;

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

    storeData("game", newGame);
    router.push("/");
  }

  function stepCycler() {
    switch (characterCreationStep) {
      case 0:
        return (
          <>
            <Text className="pt-12 text-center text-2xl">Witch Or Wizard?</Text>
            <View className="flex flex-row justify-between pt-12">
              <Pressable
                onPress={() => {
                  setWitchOrWizard("Witch");
                }}
              >
                {({ pressed }) => (
                  <View
                    className={`${
                      pressed || witchOrWizard == "Witch"
                        ? "scale-110 rounded-lg bg-zinc-400"
                        : null
                    } px-2 py-4`}
                  >
                    <View className="mr-6 -rotate-12">
                      <WitchHat height={120} width={120} color={"#4c1d95"} />
                    </View>
                    <Text
                      style={{
                        color:
                          pressed || witchOrWizard == "Witch"
                            ? "black"
                            : colorScheme == "dark"
                            ? "white"
                            : "black",
                      }}
                      className="mx-auto text-xl"
                    >
                      Witch
                    </Text>
                  </View>
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  setWitchOrWizard("Wizard");
                }}
              >
                {({ pressed }) => (
                  <View
                    className={`${
                      pressed || witchOrWizard == "Wizard"
                        ? "scale-110 rounded-lg bg-zinc-400"
                        : null
                    } px-2 py-4`}
                  >
                    <View className="ml-6 rotate-12">
                      <WizardHat
                        height={114}
                        width={120}
                        style={{ marginBottom: 5 }}
                        color={"#1e40af"}
                      />
                    </View>
                    <Text
                      style={{
                        color:
                          pressed || witchOrWizard == "Wizard"
                            ? "black"
                            : colorScheme == "dark"
                            ? "white"
                            : "black",
                      }}
                      className="mx-auto text-xl"
                    >
                      Wizard
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
            {witchOrWizard !== "" ? (
              <View className="mx-auto mt-24">
                <Pressable
                  onPress={() => setCharacterCreationStep((prev) => prev + 1)}
                >
                  {({ pressed }) => (
                    <View
                      className={`rounded-lg bg-blue-400 px-8 py-4 dark:bg-blue-800 ${
                        pressed ? "scale-95 opacity-30" : null
                      }`}
                    >
                      <Text style={{ color: "white" }} className="text-2xl">
                        Next
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            ) : null}
          </>
        );
      case 1:
        return (
          <>
            <Text className="py-8 text-center text-2xl text-zinc-900 dark:text-zinc-50">
              {`Choose Your ${witchOrWizard}'s Name`}
            </Text>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <TextInput
                className="rounded border border-zinc-800 pl-2 text-xl dark:border-zinc-100 dark:text-zinc-50"
                onChangeText={setFirstName}
                placeholder={"Given Name (First Name)"}
                value={firstName}
                maxLength={16}
                style={{ paddingVertical: 8 }}
              />
              <Text className="pl-1 italic">
                Minimum Length: 3, Maximum Length: 16
              </Text>
              <TextInput
                className="mt-8 rounded border border-zinc-800 pl-2 text-xl dark:border-zinc-100 dark:text-zinc-50"
                onChangeText={setLastName}
                placeholder={"Surname (Last Name)"}
                value={lastName}
                maxLength={16}
                style={{ paddingVertical: 8 }}
              />
              <Text className="pl-1 italic">
                Minimum Length: 3, Maximum Length: 16
              </Text>
            </KeyboardAvoidingView>
            {firstName.length >= 3 && lastName.length >= 3 ? (
              <View className="mx-auto mt-24">
                <Pressable
                  onPress={() => setCharacterCreationStep((prev) => prev + 1)}
                >
                  {({ pressed }) => (
                    <View
                      className={`rounded-lg bg-blue-400 px-8 py-4 dark:bg-blue-800 ${
                        pressed ? "scale-95 opacity-30" : null
                      }`}
                    >
                      <Text style={{ color: "white" }} className="text-2xl">
                        Next
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            ) : null}
          </>
        );
      case 2:
        return (
          <>
            <Text className="py-8 text-center text-2xl text-zinc-900 dark:text-zinc-50">
              {`Under What Stars Was ${witchOrWizard} Born?`}
            </Text>
            <Text className="py-1 text-center">
              Fire Signs are more adept at Fire Based Magics
            </Text>
            <Text className="py-1 text-center">
              Earth Signs are more adept at Earth Based Magics
            </Text>
            <Text className="py-1 text-center">Etc..</Text>
            <View className="mt-4 flex max-w-full justify-center">
              <View
                className="flex rounded"
                style={{ backgroundColor: "#f87171" }}
              >
                <Text className="py-2 text-center">Fire Signs</Text>
                <View className="mx-auto flex flex-row pb-4">
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("aries");
                      setElement("Fire");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "aries"
                            ? "scale-110 bg-red-200"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-aries"
                          size={64}
                          color="#C1272D"
                        />

                        <Text className="mx-auto">Aries</Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("leo");
                      setElement("Fire");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "leo"
                            ? "scale-110 bg-red-200"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-leo"
                          size={64}
                          color="#FAA21D"
                        />
                        <Text className="mx-auto">Leo</Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("sagittarius");
                      setElement("Fire");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "sagittarius"
                            ? "scale-110 bg-red-200"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-sagittarius"
                          size={64}
                          color="#EFAA43"
                        />
                        <Text className="mx-auto">Sagittarius</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
              <View
                className="mt-1 flex rounded"
                style={{ backgroundColor: "#937D62" }}
              >
                <Text className="py-2 text-center">Earth Signs</Text>
                <View className="mx-auto flex flex-row pb-4">
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("taurus");
                      setElement("Earth");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "taurus"
                            ? "scale-110 bg-[#B1A89B]"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-taurus"
                          size={64}
                          color="#006E51"
                        />

                        <Text className="mx-auto">Taurus</Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("virgo");
                      setElement("Earth");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "virgo"
                            ? "scale-110 bg-[#B1A89B]"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-virgo"
                          size={64}
                          color="#447C69"
                        />
                        <Text className="mx-auto">Virgo</Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("capricorn");
                      setElement("Earth");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "capricorn"
                            ? "scale-110 bg-[#B1A89B]"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-capricorn"
                          size={64}
                          color="#154577"
                        />
                        <Text className="mx-auto">Capricorn</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
              <View
                className="mt-1 flex rounded"
                style={{ backgroundColor: "#e2e8f0" }}
              >
                <Text style={{ color: "black" }} className="py-2 text-center">
                  Air Signs
                </Text>
                <View className="mx-auto flex flex-row pb-4">
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("gemini");
                      setElement("Air");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "gemini"
                            ? "scale-110 bg-slate-50"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-gemini"
                          size={64}
                          color="#1D6996"
                        />
                        <Text style={{ color: "black" }} className="mx-auto">
                          Gemini
                        </Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("libra");
                      setElement("Air");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "libra"
                            ? "scale-110 bg-slate-50"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-libra"
                          size={64}
                          color="#B67162"
                        />
                        <Text style={{ color: "black" }} className="mx-auto">
                          Libra
                        </Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("aquarius");
                      setElement("Air");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "aquarius"
                            ? "scale-110 bg-slate-50"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-aquarius"
                          size={64}
                          color="#43919A"
                        />
                        <Text style={{ color: "black" }} className="mx-auto">
                          Aquarius
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
              <View
                className="mt-1 flex rounded"
                style={{ backgroundColor: "#60a5fa" }}
              >
                <Text className="py-2 text-center">Water Signs</Text>
                <View className="mx-auto flex flex-row pb-4">
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("cancer");
                      setElement("Water");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "cancer"
                            ? "scale-110 bg-blue-300"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-cancer"
                          size={64}
                          color="#E7D2CC"
                        />
                        <Text className="mx-auto">Cancer</Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("scorpio");
                      setElement("Water");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "scorpio"
                            ? "scale-110 bg-blue-300"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-scorpio"
                          size={64}
                          color="#5E2129"
                        />
                        <Text className="mx-auto">Scorpio</Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    className="mx-1"
                    onPress={() => {
                      setStar("scorpio");
                      setElement("Water");
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${
                          pressed || star == "pisces"
                            ? "scale-110 bg-blue-300"
                            : null
                        } rounded-xl px-2`}
                      >
                        <MaterialCommunityIcons
                          name="zodiac-pisces"
                          size={64}
                          color="#EF4671"
                        />
                        <Text className="mx-auto">Pisces</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
            {star !== "" ? (
              <View className="mx-auto mt-8">
                <Pressable
                  onPress={() => setCharacterCreationStep((prev) => prev + 1)}
                >
                  {({ pressed }) => (
                    <View
                      className={`rounded-lg bg-blue-400 px-8 py-4 dark:bg-blue-800 ${
                        pressed ? "scale-95 opacity-30" : null
                      }`}
                    >
                      <Text style={{ color: "white" }} className="text-2xl">
                        Review
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            ) : null}
          </>
        );
      case 3:
        return (
          <>
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
          </>
        );
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "New Game" }} />
      <ScrollView>
        <Text className="bold pt-16 text-center text-3xl">
          Create a Character
        </Text>
        {characterCreationStep > 0 ? (
          <Pressable
            className="absolute"
            style={{ alignItems: "flex-start" }}
            onPress={() => setCharacterCreationStep((prev) => prev - 1)}
          >
            {({ pressed }) => (
              <View
                className={`rounded-lg bg-blue-400 px-4 py-1 mt-2 ml-2 dark:bg-blue-800 ${
                  pressed ? "scale-95 opacity-30" : null
                }`}
              >
                <Text style={{ color: "white" }} className="text-2xl">
                  {`<< Back`}
                </Text>
              </View>
            )}
          </Pressable>
        ) : null}
        <View className="">
          <View className="mx-auto my-8 w-4/5">{stepCycler()}</View>
          {/* Use a light status bar on iOS to account for the black space above the modal */}
        </View>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </ScrollView>
    </>
  );
}
