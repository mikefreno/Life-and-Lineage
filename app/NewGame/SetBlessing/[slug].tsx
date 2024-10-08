import { Pressable, View } from "react-native";
import {
  ScrollView,
  Text,
  View as ThemedView,
} from "../../../components/Themed";
import { useContext, useEffect, useRef, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { useVibration } from "../../../utility/customHooks";
import { AppContext } from "../../_layout";
import { FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import TutorialModal from "../../../components/TutorialModal";
import { DescriptionMap } from "../../../utility/descriptions";
import {
  Element,
  ElementToString,
  PlayerClassOptions,
  TutorialOption,
  isPlayerClassOptions,
} from "../../../utility/types";

import BlessingDisplay from "../../../components/BlessingsDisplay";
import {
  loadStoredTutorialState,
  updateStoredTutorialState,
  toTitleCase,
} from "../../../utility/functions/misc";
import {
  elementalColorMap,
  playerClassColors,
} from "../../../constants/Colors";
import GenericFlatButton from "../../../components/GenericFlatButton";

export default function SetBlessing() {
  const { slug } = useLocalSearchParams();
  if (!slug) {
    return router.replace("/NewGame");
  }
  let playerClass: PlayerClassOptions;

  if (isPlayerClassOptions(slug)) {
    playerClass = slug;
  } else {
    return <Text>{`Invalid player class option: ${slug}`}</Text>;
  }

  const [blessing, setBlessing] = useState<Element>();
  const { colorScheme } = useColorScheme();
  const blessingRef = useRef<Element>();
  const vibration = useVibration();

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { gameState, dimensions } = appData;

  const [showBlessingTutorial, setShowBlessingTutorial] = useState<boolean>(
    !gameState
      ? loadStoredTutorialState()
      : gameState &&
        !gameState.tutorialsShown[TutorialOption.blessing] &&
        gameState.tutorialsEnabled
      ? true
      : false,
  );

  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? loadStoredTutorialState(),
  );

  useEffect(() => {
    if (gameState) {
      if (tutorialState == false) {
        gameState.disableTutorials();
      } else {
        gameState.enableTutorials();
      }
    } else {
      updateStoredTutorialState(tutorialState);
    }
  }, [tutorialState]);

  useEffect(() => {
    if (gameState) {
      setTutorialState(gameState?.tutorialsEnabled);
    }
  }, [gameState?.tutorialsEnabled]);

  interface BlessingPressableProps {
    element: Element;
  }
  const BlessingPressable = ({ element }: BlessingPressableProps) => {
    return (
      <Pressable
        onPress={() => {
          vibration({ style: "light" });
          setBlessing(element);
          blessingRef.current = element;
        }}
        style={{
          height: dimensions.height * 0.25,
          width: dimensions.width * 0.45,
        }}
      >
        {({ pressed }) => (
          <View
            className={`${
              pressed || blessing == element
                ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                : "border-transparent"
            } w-full h-full border flex items-center justify-center`}
          >
            <BlessingDisplay
              blessing={element}
              colorScheme={colorScheme}
              size={dimensions.height * 0.15}
            />
            <Text
              className="text-center text-lg px-2"
              style={{
                color:
                  element == Element.assassination && colorScheme == "dark"
                    ? elementalColorMap[element].light
                    : elementalColorMap[element].dark,
              }}
            >
              Blessing of {ElementToString[element]}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  function classDependantBlessings() {
    if (playerClass == "mage") {
      return (
        <View className="flex items-center justify-evenly py-6">
          <ThemedView className="mb-8 flex flex-row justify-evenly">
            <BlessingPressable element={Element.fire} />
            <BlessingPressable element={Element.water} />
          </ThemedView>
          <ThemedView className="flex flex-row justify-evenly">
            <BlessingPressable element={Element.air} />
            <BlessingPressable element={Element.earth} />
          </ThemedView>
        </View>
      );
    } else if (playerClass == "necromancer") {
      return (
        <View className="flex items-center justify-evenly py-6">
          <ThemedView className="mb-8 flex flex-row justify-evenly">
            <BlessingPressable element={Element.summoning} />
            <BlessingPressable element={Element.pestilence} />
          </ThemedView>
          <ThemedView className="flex flex-row justify-evenly">
            <BlessingPressable element={Element.bone} />
            <BlessingPressable element={Element.blood} />
          </ThemedView>
        </View>
      );
    } else if (playerClass == "paladin") {
      return (
        <View className="flex items-center justify-evenly py-6">
          <BlessingPressable element={Element.holy} />
          <ThemedView className="mt-8 flex flex-row justify-evenly">
            <BlessingPressable element={Element.vengeance} />
            <BlessingPressable element={Element.protection} />
          </ThemedView>
        </View>
      );
    } else if (playerClass == "ranger") {
      return (
        <View className="flex items-center justify-evenly py-6">
          <BlessingPressable element={Element.beastMastery} />
          <ThemedView className="mt-8 flex flex-row justify-evenly">
            <BlessingPressable element={Element.arcane} />
            <BlessingPressable element={Element.assassination} />
          </ThemedView>
        </View>
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
        isVisibleCondition={showBlessingTutorial}
        tutorial={TutorialOption.blessing}
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
        <ThemedView className="flex-1 pt-[8vh]">
          <Text className="text-center text-2xl">
            With What Blessing Was Your
            <Text
              style={{ color: playerClassColors[playerClass] }}
            >{` ${toTitleCase(playerClass)} `}</Text>
            Born?
          </Text>
          <>
            {classDependantBlessings()}
            <Text className="text-center md:text-lg px-4">
              {DescriptionMap[blessing as Element]}
            </Text>
            {blessing ? (
              <View className="mx-auto h-32 py-2">
                <GenericFlatButton
                  onPressFunction={() => {
                    vibration({ style: "light" });
                    router.push(
                      `/NewGame/SetSex/${playerClass}/${blessingRef.current}`,
                    );
                  }}
                >
                  <Text className="text-xl tracking-widest">Next</Text>
                </GenericFlatButton>
              </View>
            ) : (
              <View className="h-32"></View>
            )}
          </>
        </ThemedView>
      </ScrollView>
      {(gameState && gameState.tutorialsEnabled) ||
        (!gameState && (
          <View className="absolute ml-4 mt-4">
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
          </View>
        ))}
    </>
  );
}
