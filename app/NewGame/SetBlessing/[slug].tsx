import { Pressable, View as NonThemedView } from "react-native";
import { ScrollView, Text, View } from "../../../components/Themed";
import { useContext, useEffect, useRef, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
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
import { AppContext } from "../../_layout";
import { FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TutorialModal from "../../../components/TutorialModal";
import { toTitleCase } from "../../../utility/functions/misc/words";

const descriptionMap: Record<string, string> = {
  fire: "With Fire, comes aggression. You will deal damage quickly and potentially burn enemies for additional damage over time.",
  water:
    "With Water, comes balance. You will deal moderate damage, reduce incoming damage, and even heal yourself",
  air: "With Air, come control. You will bend the battlefield to your whim, from amplifying damage, to becoming impossible to hit.",
  earth:
    "With Earth, comes adamace. You will become unbreakable and stun your enemies in their place",
  summoning:
    "With Summoning, you will bend the undead to your will, overwhelm your enemies.",
  pestilence:
    "With Pesitilence, you will control an unseen force to cripple your enemies, or destroy them from within.",
  bone: "With Bone, you will shield yourself or destroy your foes.",
  blood:
    "With Blood, you will control the life force of enemies and yourself, sacrifice for ultimate power.",
  holy: "With Holy, you will heal yourself, others, and blast away the undead.",
  vengeance:
    "With Vengeance, you will smite the unworthy, combining arms with blessed power.",
  protection:
    "With Protection, you will shield yourself and others, become invulnerable.",
};

export default function SetBlessing() {
  const { slug } = useLocalSearchParams();
  if (!slug) {
    return router.replace("/NewGame");
  }
  const playerClass = slug as string;

  const [blessing, setBlessing] = useState<string>("");
  const { colorScheme } = useColorScheme();
  const blessingRef = useRef<string>();
  const vibration = useVibration();

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { gameState } = appData;

  const [showBlessingTutorial, setShowBlessingTutorial] = useState<boolean>(
    !gameState ||
      (gameState &&
        !gameState.getTutorialState("blessing") &&
        gameState.tutorialsEnabled)
      ? true
      : false,
  );

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

  useEffect(() => {
    if (gameState) {
      setTutorialState(gameState?.tutorialsEnabled);
    }
  }, [gameState?.tutorialsEnabled]);

  const accent =
    playerClass == "mage"
      ? "#2563eb"
      : playerClass == "necromancer"
      ? "#9333ea"
      : "#fcd34d";

  function classDependantBlessings() {
    if (playerClass == "mage") {
      return (
        <NonThemedView className="flex items-center justify-evenly py-6">
          <View className="mb-8 flex flex-row justify-evenly">
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
          <View className="my-[6vh] flex flex-row justify-evenly">
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
        </NonThemedView>
      );
    } else if (playerClass == "necromancer") {
      return (
        <NonThemedView className="flex items-center justify-evenly py-6">
          <View className="mb-8 flex flex-row justify-evenly">
            <Pressable
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
          <NonThemedView className="my-[6vh] flex flex-row justify-evenly">
            <Pressable
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
          </NonThemedView>
        </NonThemedView>
      );
    } else if (playerClass == "paladin") {
      return (
        <NonThemedView className="flex items-center justify-evenly py-6">
          <Pressable
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
                } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
          <NonThemedView className="my-[6vh] flex flex-row justify-evenly">
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
                  } px-6 py-4 border h-[20vh] min-h-[196] w-[45vw]`}
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
          </NonThemedView>
        </NonThemedView>
      );
    } else throw new Error("invalid class set");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Blessing",
          headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          headerBackTitleStyle: { fontFamily: "PixelifySans" },
        }}
      />
      <TutorialModal
        isVisibleCondition={
          !gameState
            ? loadedAsync
              ? showBlessingTutorial
              : false
            : showBlessingTutorial
        }
        backFunction={() => setShowBlessingTutorial(false)}
        onCloseFunction={() => setShowBlessingTutorial(false)}
        pageOne={{
          title:
            "Magic is a extremely powerful, but often very expensive obtain.",
          body: "You will start with a book providing a spell pertaining to blessing you choose, and a higher starting point in that school.",
        }}
        pageTwo={{
          body: "Each of the blessings are for your class, you can learn from of these schools, but not from a school for a different class.",
        }}
      />
      <ScrollView>
        <View className="flex-1 px-[5vw] pt-[8vh]">
          <Text className="text-center text-2xl">
            With What Blessing Was Your
            <Text style={{ color: accent }}>{` ${toTitleCase(
              playerClass,
            )} `}</Text>
            Born?
          </Text>
          <View className="flex-1 justify-evenly">
            {classDependantBlessings()}
            <Text className="text-center md:text-lg">
              {descriptionMap[blessing]}
            </Text>
            {blessing ? (
              <NonThemedView className="mx-auto h-32 py-2">
                <Pressable
                  onPress={() => {
                    vibration({ style: "light" });
                    router.push(
                      `/NewGame/SetSex/${playerClass}/${blessingRef.current}`,
                    );
                  }}
                  className="rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text className="text-xl tracking-widest">Next</Text>
                </Pressable>
              </NonThemedView>
            ) : (
              <NonThemedView className="h-32"></NonThemedView>
            )}
          </View>
        </View>
      </ScrollView>
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
    </>
  );
}
