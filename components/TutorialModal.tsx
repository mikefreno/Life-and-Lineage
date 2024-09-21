import { useContext, useEffect, useRef, useState } from "react";
import { View, Text } from "./Themed";
import { Entypo } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { AppContext } from "../app/_layout";
import { useVibration } from "../utility/customHooks";
import { Pressable, Switch } from "react-native";
import {
  loadStoredTutorialState,
  updateStoredTutorialState,
} from "../utility/functions/misc";
import { TutorialOption } from "../utility/types";
import GenericModal from "./GenericModal";

interface TutorialModalProps {
  isVisibleCondition: boolean;
  tutorial: TutorialOption;
  backFunction?: () => void;
  onCloseFunction?: () => void;
  pageOne: { title: string; body: string };
  pageTwo?: { title?: string; body: string };
  pageThree?: { title?: string; body: string };
}

export default function TutorialModal({
  isVisibleCondition,
  tutorial,
  backFunction,
  onCloseFunction,
  pageOne,
  pageTwo,
  pageThree,
}: TutorialModalProps) {
  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("missing context");
  }
  const { gameState } = appData;
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const tutorialStepRef = useRef<number>(1);
  const { colorScheme } = useColorScheme();
  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const vibration = useVibration();

  useEffect(() => {
    setTutorialState(gameState?.tutorialsEnabled ?? true);
  }, [gameState?.tutorialsEnabled]);

  useEffect(() => {
    if (!firstLoad) {
      if (gameState) {
        if (tutorialState == false) {
          gameState.disableTutorials();
        } else {
          gameState.enableTutorials();
        }
      } else {
        updateStoredTutorialState(tutorialState);
      }
    } else {
      if (!gameState) {
        loadStoredTutorialState();
      }
      setFirstLoad(false);
    }
  }, [tutorialState]);

  const press = () => {
    if (tutorialStepRef.current == 1 && pageTwo) {
      setTutorialStep(2);
      tutorialStepRef.current = 2;
    } else if (tutorialStepRef.current == 2 && pageThree) {
      setTutorialStep(3);
      tutorialStepRef.current = 3;
    } else {
      vibration({ style: "light" });
      if (onCloseFunction) {
        onCloseFunction();
      }
      gameState?.updateTutorialState(tutorial, true);
    }
  };

  return (
    <GenericModal
      isVisibleCondition={isVisibleCondition}
      backFunction={() => {
        if (backFunction) {
          backFunction();
        }
        gameState?.updateTutorialState(tutorial, true);
      }}
    >
      {pageTwo && (
        <View
          className={`flex flex-row ${
            tutorialStep != 1 ? "justify-between" : "justify-end"
          }`}
        >
          {tutorialStep != 1 ? (
            <Pressable
              onPress={() => {
                setTutorialStep((prev) => prev - 1);
                tutorialStepRef.current--;
              }}
            >
              <Entypo
                name="chevron-left"
                size={24}
                color={colorScheme == "dark" ? "#f4f4f5" : "black"}
              />
            </Pressable>
          ) : null}
          <Text>
            {tutorialStep}/{pageThree ? 3 : 2}
          </Text>
        </View>
      )}
      {tutorialStep == 1 ? (
        <>
          <Text className="text-center text-2xl md:text-3xl">
            {pageOne.title}
          </Text>
          <Text className="my-4 text-center text-lg md:text-xl">
            {pageOne.body}
          </Text>
          <View className="mx-auto my-[2vh] flex flex-row">
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
            onPress={press}
            className="mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text>{pageTwo ? "Next" : "Close"}</Text>
          </Pressable>
        </>
      ) : tutorialStep == 2 && pageTwo ? (
        <>
          {pageTwo.title && (
            <Text className="text-center text-2xl md:text-3xl">
              {pageTwo.title}
            </Text>
          )}
          <Text className="mt-2 text-center text-lg md:text-xl">
            {pageTwo.body}
          </Text>
          <View className="mx-auto my-[2vh] flex flex-row">
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
            onPress={press}
            className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text>{pageThree ? "Next" : "Close"}</Text>
          </Pressable>
        </>
      ) : (
        tutorialStep == 3 &&
        pageThree && (
          <>
            {pageThree.title && (
              <Text className="text-center text-2xl md:text-3xl">
                {pageThree.title}
              </Text>
            )}
            <Text className="mt-2 text-center text-lg md:text-xl">
              {pageThree.body}
            </Text>
            <View className="mx-auto my-[2vh] flex flex-row">
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
              onPress={press}
              className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text>Close</Text>
            </Pressable>
          </>
        )
      )}
    </GenericModal>
  );
}
