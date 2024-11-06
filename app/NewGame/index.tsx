import { Pressable, useColorScheme, View } from "react-native";
import { ScrollView, Text, View as ThemedView } from "../../components/Themed";
import "../../assets/styles/globals.css";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import { Stack, router } from "expo-router";
import { useVibration } from "../../utility/customHooks";
import { AppContext } from "../_layout";
import { FontAwesome5 } from "@expo/vector-icons";
import TutorialModal from "../../components/TutorialModal";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "../../assets/icons/SVGIcons";
import { TutorialOption } from "../../utility/types";
import { ClassDescriptionMap } from "../../utility/descriptions";
import GenericFlatButton from "../../components/GenericFlatButton";
import GenericModal from "../../components/GenericModal";
import { wait } from "../../utility/functions/misc";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";

const SetClassScreen = observer(() => {
  const [selectedClass, setSelectedClass] = useState<
    "mage" | "necromancer" | "paladin" | "ranger"
  >();
  let classRef = useRef<"mage" | "necromancer" | "paladin" | "ranger">();
  const colorScheme = useColorScheme();
  const vibration = useVibration();

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context!");
  const { gameState, dimensions } = appData;

  const isFocused = useIsFocused();

  const [forceShowTutorial, setForceShowTutorial] = useState<boolean>(false);

  const [showTutorialReset, setShowTutorialReset] = useState<boolean>(false);

  useLayoutEffect(() => {
    wait(200).then(() => {
      setShowTutorialReset(!!gameState);
    });
  }, []);

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.class}
        override={forceShowTutorial}
        isFocused={isFocused}
        clearOverride={() => setForceShowTutorial(false)}
        pageOne={{
          title: "Welcome To Life and Lineage!",
          body: "Let's start with selecting your class...",
        }}
      />
      <GenericModal
        isVisibleCondition={showTutorialReset}
        backFunction={() => setShowTutorialReset(false)}
      >
        <Text className="text-center text-2xl">Tutorial Reset</Text>
        <Text className="text-center text-lg">
          Would you like to reset tutorials?
        </Text>
        <ThemedView className="flex flex-row">
          <Pressable
            onPress={() => {
              setShowTutorialReset(false);
              if (!!gameState) {
                wait(750).then(() => {
                  gameState.resetTutorialState(() =>
                    setForceShowTutorial(true),
                  );
                });
              }
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
      </GenericModal>
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
              <GenericFlatButton
                onPressFunction={() => {
                  vibration({ style: "light" });
                  router.push(`/NewGame/SetBlessing/${classRef.current}`);
                }}
              >
                Next
              </GenericFlatButton>
            </View>
          )}
        </ThemedView>
      </ScrollView>
      {((gameState && gameState.tutorialsEnabled) || !gameState) && (
        <View className="absolute ml-4 mt-4">
          <Pressable
            className="absolute z-top"
            onPress={() => {
              setForceShowTutorial(true);
            }}
          >
            <FontAwesome5
              name="question-circle"
              size={32}
              color={colorScheme == "light" ? "#27272a" : "#fafafa"}
            />
          </Pressable>
        </View>
      )}
    </>
  );
});
export default SetClassScreen;
