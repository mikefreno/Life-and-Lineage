import { Pressable, View as NonThemedView, Switch } from "react-native";
import { Text, ScrollView, View } from "../../../components/Themed";
import { useContext, useEffect, useRef, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { toTitleCase } from "../../../utility/functions";
import { router } from "expo-router";
import Fire from "../../../assets/icons/FireIcon";
import Water from "../../../assets/icons/WaterIcon";
import Air from "../../../assets/icons/AirIcon";
import Earth from "../../../assets/icons/EarthIcon";
import Sun from "../../../assets/icons/SunIcon";
import Swords from "../../../assets/icons/SwordsIcon";
import Shield from "../../../assets/icons/ShieldIcon";
import Drop from "../../../assets/icons/DropIcon";
import HoldingSkull from "../../../assets/icons/HoldingSkull";
import Bones from "../../../assets/icons/BonesIcon";
import Virus from "../../../assets/icons/VirusIcon";
import { useVibration } from "../../../utility/customHooks";
import { GameContext } from "../../_layout";
import Modal from "react-native-modal";
import { Entypo, FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SetBlessing() {
  const { slug } = useLocalSearchParams();
  const [blessing, setBlessing] = useState<string>("");
  const playerClass = slug[0];
  const sex = slug[1];
  const firstName = toTitleCase(slug[2]);
  const lastName = toTitleCase(slug[3]);
  const { colorScheme } = useColorScheme();
  const blessingRef = useRef<string>();
  const vibration = useVibration();

  const gameContext = useContext(GameContext);
  const gameState = gameContext?.gameState;

  const [showBlessingTutorial, setShowBlessingTutorial] = useState<boolean>(
    !gameState || (gameState && !gameState.getTutorialState("blessing"))
      ? true
      : false,
  );

  const [tutorialStep, setTutorialStep] = useState<number>(1);

  const [loadedAsync, setLoadedAsync] = useState<boolean>(false);
  let tutorialStateRef = useRef<boolean>(gameState?.tutorialsEnabled ?? true);

  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );

  useEffect(() => {
    if (!showBlessingTutorial && gameState) {
      gameState.updateTutorialState("blessing", true);
    }
  }, [showBlessingTutorial]);

  useEffect(() => {
    if (!gameState) {
      loadAsyncTutorialState();
    }
  }, []);

  async function loadAsyncTutorialState() {
    const res = await AsyncStorage.getItem("tutorialsEnabled");
    if (res) {
      const parsed: boolean = JSON.parse(res);
      setShowBlessingTutorial(parsed);
      setTutorialState(parsed);
      tutorialStateRef.current = parsed;
    }
    setLoadedAsync(true);
  }

  useEffect(() => {
    async function updateAsyncTutorialState() {
      if (tutorialState == false) {
        await AsyncStorage.setItem("tutorialsEnabled", JSON.stringify(false));
      } else {
        await AsyncStorage.setItem("tutorialsEnabled", JSON.stringify(true));
      }
    }

    if (gameState) {
      if (tutorialState == false) {
        gameState.disableTutorials();
      } else {
        gameState.enableTutorials();
      }
    } else {
      updateAsyncTutorialState();
    }
  }, [tutorialState]);

  function tutorialStateDependantPress() {
    if (tutorialStateRef.current) {
      setTutorialStep((prev) => prev + 1);
    } else {
      setShowBlessingTutorial(false);
    }
  }

  function classDependantBlessings() {
    if (playerClass == "mage") {
      return (
        <View className="flex justify-evenly">
          <View className="flex flex-row justify-evenly">
            <Pressable
              onPress={() => {
                setBlessing("fire");
                blessingRef.current = "fire";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "fire"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <Fire
                      height={120}
                      width={90}
                      style={{ marginBottom: 5 }}
                      color={"#ea580c"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#ea580c" }}
                  >
                    Blessing of Fire
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setBlessing("water");
                blessingRef.current = "water";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "water"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <Water
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#3b82f6"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#3b82f6" }}
                  >
                    Blessing of Water
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
          <View className="mt-6 flex flex-row justify-evenly">
            <Pressable
              onPress={() => {
                setBlessing("air");
                blessingRef.current = "air";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "air"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <Air
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#cbd5e1"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#cbd5e1" }}
                  >
                    Blessing of Air
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setBlessing("earth");
                blessingRef.current = "earth";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "earth"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <Earth
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#937D62"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#937D62" }}
                  >
                    Blessing of Earth
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
        </View>
      );
    } else if (playerClass == "necromancer") {
      return (
        <View className="flex justify-evenly">
          <View className="flex flex-row justify-evenly">
            <Pressable
              className="w-1/2"
              onPress={() => {
                setBlessing("summoning");
                blessingRef.current = "summoning";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "summoning"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <HoldingSkull
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#4b5563"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#4b5563" }}
                  >
                    Blessing of Summons
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              className="w-1/2"
              onPress={() => {
                setBlessing("pestilence");
                blessingRef.current = "pestilence";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "pestilence"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <Virus
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={colorScheme == "dark" ? "#84cc16" : "#65a30d"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#84cc16" }}
                  >
                    Blessing of Pestilence
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
          <View className="mt-6 flex flex-row justify-evenly">
            <Pressable
              className="w-1/2"
              onPress={() => {
                setBlessing("bone");
                blessingRef.current = "bone";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "bone"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <Bones
                      height={120}
                      width={100}
                      style={{ marginBottom: 5 }}
                      color={"#9ca3af"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#9ca3af" }}
                  >
                    Blessing of Bones
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              className="w-1/2"
              onPress={() => {
                setBlessing("blood");
                blessingRef.current = "blood";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "blood"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <Drop
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#991b1b"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#991b1b" }}
                  >
                    Blessing of Blood
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
        </View>
      );
    } else if (playerClass == "paladin") {
      return (
        <View className="flex justify-evenly">
          <Pressable
            className="mx-auto"
            onPress={() => {
              setBlessing("holy");
              blessingRef.current = "holy";
            }}
          >
            {({ pressed }) => (
              <NonThemedView
                className={`${
                  pressed || blessing == "holy"
                    ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                    : "border-transparent"
                } px-6 py-4 border`}
              >
                <NonThemedView className="mx-auto">
                  <Sun
                    height={120}
                    width={120}
                    style={{ marginBottom: 5 }}
                    color={"#facc15"}
                  />
                </NonThemedView>
                <Text
                  className="text-center text-lg"
                  style={{ color: "#facc15" }}
                >
                  Holy Blessing
                </Text>
              </NonThemedView>
            )}
          </Pressable>
          <View className="-mx-4 mt-6 flex flex-row justify-evenly">
            <Pressable
              onPress={() => {
                setBlessing("vengeance");
                blessingRef.current = "vengeance";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "vengeance"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <Swords
                      height={100}
                      width={100}
                      style={{ marginBottom: 5 }}
                      color={"#cbd5e1"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#cbd5e1" }}
                  >
                    Blessing of Vengeance
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setBlessing("protection");
                blessingRef.current = "protection";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "protection"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <NonThemedView className="mx-auto">
                    <Shield
                      height={100}
                      width={100}
                      style={{ marginBottom: 5 }}
                      color={"#3b82f6"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#3b82f6" }}
                  >
                    Blessing of Protection
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
        </View>
      );
    } else throw new Error("invalid class set");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Blessing",
        }}
      />
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.2}
        animationInTiming={500}
        animationOutTiming={300}
        isVisible={
          !gameState
            ? loadedAsync
              ? showBlessingTutorial
              : false
            : showBlessingTutorial
        }
        onBackdropPress={() => setShowBlessingTutorial(false)}
        onBackButtonPress={() => setShowBlessingTutorial(false)}
      >
        <View
          className="mx-auto w-5/6 rounded-xl bg-zinc-50 px-6 py-4 dark:bg-zinc-700"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },

            shadowOpacity: 0.25,
            shadowRadius: 5,
          }}
        >
          <View
            className={`flex flex-row ${
              tutorialStep == 2 ? "justify-between" : "justify-end"
            }`}
          >
            {tutorialStep == 2 ? (
              <Pressable onPress={() => setTutorialStep((prev) => prev - 1)}>
                <Entypo
                  name="chevron-left"
                  size={24}
                  color={colorScheme == "dark" ? "#f4f4f5" : "black"}
                />
              </Pressable>
            ) : null}
            <Text>{tutorialStep}/2</Text>
          </View>
          {tutorialStep == 1 ? (
            <>
              <Text className="text-center text-2xl">
                Magic is a extremly powerful, but often very expensive to
                obtain.
              </Text>
              <Text className="my-4 text-center text-lg">
                You will start with a book providing a spell pertaining to the
                blessing you choose, and a higher starting point in that school.
              </Text>
              <View className="mx-auto flex flex-row">
                <Text className="my-auto text-lg">Tutorials Enabled: </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  ios_backgroundColor="#3e3e3e"
                  thumbColor={"white"}
                  onValueChange={(bool) => {
                    setTutorialState(bool);
                    tutorialStateRef.current = bool;
                  }}
                  value={tutorialState}
                />
              </View>
              <Pressable
                onPress={tutorialStateDependantPress}
                className="mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Next</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="mb-4 text-center text-lg">
                Each of the blessings are for your class, you can learn from any
                of these schools, but not from a school for a different class.
              </Text>
              <View className="mx-auto flex flex-row">
                <Text className="my-auto text-lg">Tutorials Enabled: </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  ios_backgroundColor="#3e3e3e"
                  thumbColor={"white"}
                  onValueChange={(bool) => setTutorialState(bool)}
                  value={tutorialState}
                />
              </View>
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  setShowBlessingTutorial(false);
                  setTimeout(() => {
                    setTutorialStep(1);
                  }, 500);
                }}
                className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
      <ScrollView>
        <View className="px-6 pb-12 pt-6">
          <Text className="py-8 text-center text-2xl text-zinc-900 dark:text-zinc-50">
            {`With What Blessing Was ${firstName} ${lastName} Born?`}
          </Text>
          {classDependantBlessings()}
          {blessing ? (
            <NonThemedView className="mx-auto mt-8">
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  router.push(
                    `/NewGame/Review/${playerClass}/${sex}/${firstName}/${lastName}/${blessingRef.current}`,
                  );
                }}
                className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text className="text-xl tracking-widest">Next</Text>
              </Pressable>
            </NonThemedView>
          ) : null}
          <View></View>
        </View>
        <NonThemedView className="absolute ml-4 mt-4">
          <Pressable
            className="absolute"
            onPress={() => setShowBlessingTutorial(true)}
          >
            <FontAwesome5
              name="question-circle"
              size={32}
              color={colorScheme == "light" ? "#27272a" : "#fafafa"}
            />
          </Pressable>
        </NonThemedView>
      </ScrollView>
    </>
  );
}
