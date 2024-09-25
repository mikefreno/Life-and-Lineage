import { Pressable, useColorScheme, View } from "react-native";
import { ScrollView, Text, View as ThemedView } from "../../components/Themed";
import "../../assets/styles/globals.css";
import { useContext, useEffect, useRef, useState } from "react";
import { Stack, router } from "expo-router";
import { useVibration } from "../../utility/customHooks";
import { AppContext } from "../_layout";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import TutorialModal from "../../components/TutorialModal";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "../../assets/icons/SVGIcons";
import { loadStoredTutorialState } from "../../utility/functions/misc";
import { TutorialOption } from "../../utility/types";
import { ClassDescriptionMap } from "../../utility/descriptions";

export default function NewGameScreen() {
  const [selectedClass, setSelectedClass] = useState<
    "mage" | "necromancer" | "paladin" | "ranger"
  >();
  let classRef = useRef<"mage" | "necromancer" | "paladin" | "ranger">();
  const colorScheme = useColorScheme();
  const vibration = useVibration();

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context!");
  const { gameState, dimensions } = appData;
  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );

  const [showIntroTutorial, setShowIntroTutorial] = useState<boolean>(
    !gameState
      ? loadStoredTutorialState()
      : gameState &&
        !gameState.tutorialsShown[TutorialOption.class] &&
        gameState.tutorialsEnabled
      ? true
      : false,
  );

  const [showTutorialReset, setShowTutorialReset] = useState<boolean>(
    gameState ? true : false,
  );

  useEffect(() => {
    if (gameState) {
      if (tutorialState == false) {
        gameState.disableTutorials();
      } else {
        gameState.enableTutorials();
      }
    } else {
      setTutorialState(tutorialState);
    }
  }, [tutorialState]);

  useEffect(() => {
    if (gameState) {
      setTutorialState(gameState?.tutorialsEnabled);
    }
  }, [gameState?.tutorialsEnabled]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Class Select",
          headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          headerBackTitleStyle: { fontFamily: "PixelifySans" },
          headerBackTitle: "Home",
        }}
      />
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.2}
        animationInTiming={500}
        animationOutTiming={300}
        isVisible={showTutorialReset}
        onBackdropPress={() => setShowTutorialReset(false)}
        onBackButtonPress={() => setShowTutorialReset(false)}
      >
        <ThemedView
          className="mx-auto w-5/6 rounded-xl px-6 py-4 dark:border dark:border-zinc-500"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            elevation: 4,
            shadowOpacity: 0.25,
            shadowRadius: 5,
          }}
        >
          <Text className="text-center text-2xl">Tutorial Reset</Text>
          <Text className="text-center text-lg">
            Would you like to reset tutorials?
          </Text>
          <ThemedView className="flex flex-row">
            <Pressable
              onPress={() => {
                gameState?.resetTutorialState();
                setShowTutorialReset(false);
                setShowIntroTutorial(true);
              }}
              className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text>Reset</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowTutorialReset(false)}
              className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text>Cancel</Text>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
      <TutorialModal
        isVisibleCondition={showIntroTutorial && !showTutorialReset}
        tutorial={TutorialOption.intro}
        backFunction={() => setShowIntroTutorial(false)}
        onCloseFunction={() => setShowIntroTutorial(false)}
        pageOne={{
          title: "Welcome To Magic Delve!",
          body: "Let's start with selecting your class...",
        }}
      />
      <ScrollView>
        <ThemedView className="flex-1 items-center px-[6vw]">
          <Text className="bold pt-[4vh] text-center text-3xl">
            Create a Character
          </Text>
          <Text className="pt-[2vh] text-center text-2xl">Select Class</Text>
          <View className="flex w-full flex-row justify-evenly">
            <Pressable
              className="-ml-2"
              onPress={() => {
                vibration({ style: "light" });
                setSelectedClass("mage");
                classRef.current = "mage";
              }}
              style={{
                height: dimensions.height * 0.25,
                width: dimensions.width * 0.45,
              }}
            >
              {({ pressed }) => (
                <View
                  className={`${
                    pressed || selectedClass == "mage"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } w-full h-full border flex items-center justify-center`}
                >
                  <WizardHat
                    style={{ marginBottom: 5 }}
                    color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                    height={dimensions.height * 0.15}
                    width={dimensions.height * 0.15}
                  />
                  <Text
                    className="mx-auto text-xl"
                    style={{ color: "#2563eb" }}
                  >
                    Mage
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable
              className="-mr-2"
              onPress={() => {
                vibration({ style: "light" });
                setSelectedClass("ranger");
                classRef.current = "ranger";
              }}
              style={{
                height: dimensions.height * 0.25,
                width: dimensions.width * 0.45,
              }}
            >
              {({ pressed }) => (
                <View
                  className={`${
                    pressed || selectedClass == "ranger"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } w-full h-full border flex items-center justify-center`}
                >
                  <View className="rotate-12">
                    <RangerIcon
                      style={{ marginBottom: 5 }}
                      height={dimensions.height * 0.15}
                      width={dimensions.height * 0.15}
                    />
                  </View>
                  <Text className="mx-auto text-xl" style={{ color: "green" }}>
                    Ranger
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
          <View className="flex w-full flex-row justify-evenly">
            <Pressable
              className="-ml-2"
              onPress={() => {
                vibration({ style: "light" });
                setSelectedClass("necromancer");
                classRef.current = "necromancer";
              }}
              style={{
                height: dimensions.height * 0.25,
                width: dimensions.width * 0.45,
              }}
            >
              {({ pressed }) => (
                <View
                  className={`${
                    pressed || selectedClass == "necromancer"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } w-full h-full border flex items-center justify-center`}
                >
                  <View className="-rotate-12">
                    <NecromancerSkull
                      style={{ marginBottom: 5 }}
                      color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                      height={dimensions.height * 0.15}
                      width={dimensions.height * 0.15}
                    />
                  </View>
                  <Text
                    className="mx-auto text-xl"
                    style={{ color: "#9333ea" }}
                  >
                    Necromancer
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable
              className="-mr-2"
              onPress={() => {
                vibration({ style: "light" });
                setSelectedClass("paladin");
                classRef.current = "paladin";
              }}
              style={{
                height: dimensions.height * 0.25,
                width: dimensions.width * 0.45,
              }}
            >
              {({ pressed }) => (
                <View
                  className={`${
                    pressed || selectedClass == "paladin"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } w-full h-full border flex items-center justify-center`}
                >
                  <View className="rotate-12">
                    <View className="scale-x-[-1] transform">
                      <PaladinHammer
                        height={dimensions.height * 0.15}
                        width={dimensions.height * 0.15}
                      />
                    </View>
                  </View>
                  <Text
                    className="mx-auto text-xl"
                    style={{ color: "#fcd34d" }}
                  >
                    Paladin
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
          <Text className="mt-[2vh] h-16 text-center md:text-lg">
            {selectedClass && ClassDescriptionMap[selectedClass]}
          </Text>
          {selectedClass && (
            <View className="mx-auto py-4 pb-[10vh]">
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  router.push(`/NewGame/SetBlessing/${classRef.current}`);
                }}
                className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text className="text-xl tracking-widest">Next</Text>
              </Pressable>
            </View>
          )}
        </ThemedView>
      </ScrollView>
      {(gameState && gameState.tutorialsEnabled) ||
        (!gameState && (
          <View className="absolute ml-4 mt-4">
            <Pressable
              className="absolute"
              onPress={() => setShowIntroTutorial(true)}
            >
              <FontAwesome5
                name="question-circle"
                size={32}
                color={colorScheme == "light" ? "#27272a" : "#fafafa"}
              />
            </Pressable>
          </View>
        ))}
    </>
  );
}
