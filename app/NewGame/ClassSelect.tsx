import { Pressable, ScrollView, View } from "react-native";
import { Text, ThemedView } from "../../components/Themed";
import "../../assets/styles/globals.css";
import { useLayoutEffect, useState } from "react";
import { router } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import TutorialModal from "../../components/TutorialModal";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "../../assets/icons/SVGIcons";
import { PlayerClassOptions, TutorialOption } from "../../utility/types";
import { ClassDescriptionMap } from "../../utility/descriptions";
import GenericModal from "../../components/GenericModal";
import { wait } from "../../utility/functions/misc";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import GenericFlatButton from "../../components/GenericFlatButton";
import { useNewGameStore } from "./_layout";

const SetClassScreen = observer(() => {
  const vibration = useVibration();
  const { classSelection, setClassSelection } = useNewGameStore();

  const { uiStore, playerState, tutorialStore } = useRootStore();
  const { colorScheme } = useColorScheme();

  const isFocused = useIsFocused();

  const [forceShowTutorial, setForceShowTutorial] = useState<boolean>(false);

  const [showTutorialReset, setShowTutorialReset] = useState<boolean>(false);

  useLayoutEffect(() => {
    wait(200).then(() => {
      setShowTutorialReset(!!playerState);
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
              if (!!playerState) {
                wait(750).then(() => {
                  tutorialStore.resetTutorialState(() =>
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
        <View className="flex-1 items-center px-[6vw]">
          <Text className="bold pt-[4vh] text-center text-3xl">
            Create a Character
          </Text>
          <Text className="pt-[2vh] text-center text-2xl">Select Class</Text>
          <View className="flex w-full flex-row justify-evenly">
            <Pressable
              className="-ml-2"
              onPress={() => {
                vibration({ style: "light" });
                setClassSelection(PlayerClassOptions.mage);
              }}
              style={{
                height: uiStore.dimensions.window.height * 0.25,
                width: uiStore.dimensions.window.width * 0.45,
              }}
            >
              {({ pressed }) => (
                <View
                  className={`${
                    pressed || classSelection == PlayerClassOptions.mage
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } w-full h-full border flex items-center justify-center`}
                >
                  <WizardHat
                    style={{ marginBottom: 5 }}
                    color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                    height={uiStore.dimensions.window.height * 0.15}
                    width={uiStore.dimensions.window.height * 0.15}
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
                setClassSelection(PlayerClassOptions.ranger);
              }}
              style={{
                height: uiStore.dimensions.window.height * 0.25,
                width: uiStore.dimensions.window.width * 0.45,
              }}
            >
              {({ pressed }) => (
                <View
                  className={`${
                    pressed || classSelection == PlayerClassOptions.ranger
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } w-full h-full border flex items-center justify-center`}
                >
                  <View className="rotate-12">
                    <RangerIcon
                      style={{ marginBottom: 5 }}
                      height={uiStore.dimensions.window.height * 0.15}
                      width={uiStore.dimensions.window.height * 0.15}
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
                setClassSelection(PlayerClassOptions.necromancer);
              }}
              style={{
                height: uiStore.dimensions.window.height * 0.25,
                width: uiStore.dimensions.window.width * 0.45,
              }}
            >
              {({ pressed }) => (
                <View
                  className={`${
                    pressed || classSelection == PlayerClassOptions.necromancer
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } w-full h-full border flex items-center justify-center`}
                >
                  <View className="-rotate-12">
                    <NecromancerSkull
                      style={{ marginBottom: 5 }}
                      color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                      height={uiStore.dimensions.window.height * 0.15}
                      width={uiStore.dimensions.window.height * 0.15}
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
                setClassSelection(PlayerClassOptions.paladin);
              }}
              style={{
                height: uiStore.dimensions.window.height * 0.25,
                width: uiStore.dimensions.window.width * 0.45,
              }}
            >
              {({ pressed }) => (
                <View
                  className={`${
                    pressed || classSelection == PlayerClassOptions.paladin
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } w-full h-full border flex items-center justify-center`}
                >
                  <View className="rotate-12">
                    <View className="scale-x-[-1] transform">
                      <PaladinHammer
                        height={uiStore.dimensions.window.height * 0.15}
                        width={uiStore.dimensions.window.height * 0.15}
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
            {classSelection && ClassDescriptionMap[classSelection]}
          </Text>
          {classSelection && (
            <View className="mx-auto py-4 pb-[10vh]">
              <GenericFlatButton
                onPress={() => {
                  vibration({ style: "light" });
                  router.push(`/NewGame/BlessingSelect`);
                }}
              >
                <Text>Next</Text>
              </GenericFlatButton>
            </View>
          )}
        </View>
      </ScrollView>
      {(tutorialStore.tutorialsEnabled || !playerState) && (
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
