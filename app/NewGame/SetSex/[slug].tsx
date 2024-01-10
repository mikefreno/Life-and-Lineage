import { Stack, router, useLocalSearchParams } from "expo-router";
import { View, Text } from "../../../components/Themed";
import { toTitleCase } from "../../../utility/functions";
import { Entypo, FontAwesome5, Foundation } from "@expo/vector-icons";
import { Pressable, View as NonThemedView, Switch } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import { useVibration } from "../../../utility/customHooks";
import Modal from "react-native-modal";
import { GameContext } from "../../_layout";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SetSex() {
  const { slug } = useLocalSearchParams();
  const [sex, setSex] = useState<"male" | "female">();
  const { colorScheme } = useColorScheme();

  let sexRef = useRef<"male" | "female">();
  const vibration = useVibration();

  const gameContext = useContext(GameContext);
  const gameState = gameContext?.gameState;

  const [showAgingTutorial, setShowAgingTutorial] = useState<boolean>(
    !gameState || (gameState && !gameState.getTutorialState("aging"))
      ? true
      : false,
  );
  const [loadedAsync, setLoadedAsync] = useState<boolean>(false);

  let tutorialStateRef = useRef<boolean>(gameState?.tutorialsEnabled ?? true);

  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );

  const [tutorialStep, setTutorialStep] = useState<number>(1);

  useEffect(() => {
    if (!showAgingTutorial && gameState) {
      gameState.updateTutorialState("aging", true);
    }
  }, [showAgingTutorial]);

  useEffect(() => {
    if (!gameState) {
      loadAsyncTutorialState();
    }
  }, []);

  async function loadAsyncTutorialState() {
    const res = await AsyncStorage.getItem("tutorialsEnabled");
    if (res) {
      const parsed: boolean = JSON.parse(res);
      setShowAgingTutorial(parsed);
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
      setShowAgingTutorial(false);
    }
  }

  const accent =
    (slug as string) == "mage"
      ? "#2563eb"
      : (slug as string) == "necromancer"
      ? "#9333ea"
      : "#fcd34d";

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sex Select",
        }}
      />
      <Modal
        animationIn="slideInUp"
        animationOut="fadeOut"
        isVisible={
          !gameState
            ? loadedAsync
              ? showAgingTutorial
              : false
            : showAgingTutorial
        }
        backdropOpacity={0.2}
        animationInTiming={500}
        onBackdropPress={() => {
          setShowAgingTutorial(false);
          setTimeout(() => {
            setTutorialStep(1);
          }, 500);
        }}
        onBackButtonPress={() => {
          setShowAgingTutorial(false);
          setTimeout(() => {
            setTutorialStep(1);
          }, 500);
        }}
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
                This game focuses around the passage of time.
              </Text>
              <Text className="my-4 text-center text-lg">
                Almost everything will move the game clock forward, aging all
                the characters in the game. At a certain point it will become
                nearly impossible to stay alive.
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
                However, if you have a child, you can live on through the child.
                Retaining much of what has been achieved in your previous life.
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
                  setShowAgingTutorial(false);
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
      <View className="flex-1">
        <Text className="pt-8 text-center text-2xl">
          Set the sex of your{" "}
          <Text style={{ color: accent }}>{toTitleCase(slug as string)}</Text>
        </Text>
        <View className="mt-12 flex flex-row items-center justify-evenly">
          <Pressable
            className="w-1/3"
            onPress={() => {
              setSex("male");
              sexRef.current = "male";
            }}
          >
            {({ pressed }) => (
              <NonThemedView
                className={`${
                  pressed || sex == "male"
                    ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                    : "border-transparent"
                } py-4 border`}
              >
                <NonThemedView className="mx-auto">
                  <Foundation name="male-symbol" size={90} color={accent} />
                </NonThemedView>
                <Text className="text-center text-lg">Male</Text>
              </NonThemedView>
            )}
          </Pressable>
          <Pressable
            className="w-1/3"
            onPress={() => {
              setSex("female");
              sexRef.current = "female";
            }}
          >
            {({ pressed }) => (
              <NonThemedView
                className={`${
                  pressed || sex == "female"
                    ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                    : "border-transparent"
                } py-4 border`}
              >
                <NonThemedView className="mx-auto">
                  <Foundation name="female-symbol" size={90} color={accent} />
                </NonThemedView>
                <Text className="text-center text-lg">Female</Text>
              </NonThemedView>
            )}
          </Pressable>
        </View>
        {sex ? (
          <NonThemedView className="mx-auto mt-8">
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                router.push(`/NewGame/SetName/${slug}/${sexRef.current}`);
              }}
              className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text className="text-xl tracking-widest">Next</Text>
            </Pressable>
          </NonThemedView>
        ) : null}
      </View>
      <NonThemedView className="absolute ml-4 mt-4">
        <Pressable
          className="absolute"
          onPress={() => setShowAgingTutorial(true)}
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
