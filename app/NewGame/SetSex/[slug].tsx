import { Stack, router, useLocalSearchParams } from "expo-router";
import { View, Text } from "../../../components/Themed";
import { toTitleCase } from "../../../utility/functions/misc";
import { FontAwesome5, Foundation } from "@expo/vector-icons";
import { Pressable, View as NonThemedView } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import { useVibration } from "../../../utility/customHooks";
import { GameContext } from "../../_layout";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TutorialModal from "../../../components/TutorialModal";

export default function SetSex() {
  const { slug } = useLocalSearchParams();
  const [sex, setSex] = useState<"male" | "female">();
  const { colorScheme } = useColorScheme();

  let sexRef = useRef<"male" | "female">();
  const vibration = useVibration();

  const gameContext = useContext(GameContext);
  const gameState = gameContext?.gameState;

  const [showAgingTutorial, setShowAgingTutorial] = useState<boolean>(
    !gameState ||
      (gameState &&
        !gameState.getTutorialState("aging") &&
        gameState.tutorialsEnabled)
      ? true
      : false,
  );
  const [loadedAsync, setLoadedAsync] = useState<boolean>(false);

  let tutorialStateRef = useRef<boolean>(gameState?.tutorialsEnabled ?? true);

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
      console.log("loading: ", parsed);
      setShowAgingTutorial(parsed);
      tutorialStateRef.current = parsed;
    }
    setLoadedAsync(true);
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
      <TutorialModal
        isVisibleCondition={
          !gameState
            ? loadedAsync
              ? showAgingTutorial
              : false
            : showAgingTutorial
        }
        backFunction={() => {
          setShowAgingTutorial(false);
        }}
        onCloseFunction={() => {
          setShowAgingTutorial(false);
        }}
        pageOne={{
          title: "This game focuses around the passage of time.",
          body: "Almost everything will move the game clock forward, aging the characters in the game. At a certain point it will nearly impossible to stay alive.",
        }}
        pageTwo={{
          body: "However, if you have a child, you can live on through the childRetaining much of what has been achieved in your previous life",
        }}
      />
      <View className="flex-1 items-center">
        <Text className="mt-[6vh] text-center text-2xl md:text-3xl">
          Set the sex of your{" "}
          <Text style={{ color: accent }}>{toTitleCase(slug as string)}</Text>
        </Text>
        <View className="mt-[12vh] flex w-full flex-row justify-evenly">
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
