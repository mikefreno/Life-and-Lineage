import { useContext, useEffect, useRef, useState } from "react";
import { View, Text } from "./Themed";
import { Entypo } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { AppContext } from "../app/_layout";
import { useVibration } from "../utility/customHooks";
import { Pressable, Switch } from "react-native";
import {
  getLocalTutorialState,
  loadStoredTutorialState,
  setLocalTutorialState,
  updateStoredTutorialState,
} from "../utility/functions/misc";
import { TutorialOption } from "../utility/types";
import GenericModal from "./GenericModal";
import { observer } from "mobx-react-lite";

type ITutorialModalBase = {
  tutorial: TutorialOption;
  isFocused: boolean;
  backFunction?: () => void;
  onCloseFunction?: () => void;
  pageOne: { title: string; body: string };
  pageTwo?: { title?: string; body: string };
  pageThree?: { title?: string; body: string };
};

type ITutorialModalWithOverride = ITutorialModalBase & {
  override: boolean;
  clearOverride: () => void;
};

type ITutorialModalWithoutOverride = ITutorialModalBase & {
  override?: never;
  clearOverride?: never;
};

type ITutorialModal =
  | ITutorialModalWithOverride
  | ITutorialModalWithoutOverride;

const TutorialModal = observer(
  ({
    isFocused,
    tutorial,
    backFunction,
    onCloseFunction,
    pageOne,
    pageTwo,
    pageThree,
    override,
    clearOverride,
  }: ITutorialModal) => {
    const appData = useContext(AppContext);
    if (!appData) {
      throw new Error("missing context");
    }
    const { gameState } = appData;
    const [tutorialStep, setTutorialStep] = useState<number>(1);
    const tutorialStepRef = useRef<number>(1);
    const { colorScheme } = useColorScheme();
    const [tutorialState, setTutorialState] = useState<boolean>(
      gameState ? gameState.tutorialsEnabled : loadStoredTutorialState(),
    );
    const [shouldShow, setShouldShow] = useState<boolean>(false);
    const vibration = useVibration();

    useEffect(() => {
      setTutorialState(
        gameState ? gameState.tutorialsEnabled : loadStoredTutorialState(),
      );
      if (isFocused) {
        if (override) {
          setShouldShow(override);
        } else {
          if (gameState) {
            if (gameState.tutorialsEnabled) {
              setShouldShow(!gameState.tutorialsShown[tutorial]);
            }
          } else {
            const tutorialsEnabled = loadStoredTutorialState();
            setShouldShow(tutorialsEnabled && !getLocalTutorialState(tutorial));
          }
        }
      }
    }, [
      gameState?.tutorialsEnabled,
      gameState?.tutorialsShown[tutorial],
      override,
      isFocused,
    ]);

    const press = () => {
      if (tutorialStepRef.current == 1 && pageTwo) {
        setTutorialStep(2);
        tutorialStepRef.current = 2;
      } else if (tutorialStepRef.current == 2 && pageThree) {
        setTutorialStep(3);
        tutorialStepRef.current = 3;
      } else {
        closeTutorial();
      }
    };

    const closeTutorial = () => {
      vibration({ style: "light" });
      if (onCloseFunction) {
        onCloseFunction();
      }
      if (clearOverride) {
        clearOverride();
      }
      if (gameState) {
        gameState.updateTutorialState(tutorial, true);
        if (tutorialState) {
          gameState.enableTutorials();
        } else {
          gameState.disableTutorials();
          setShouldShow(false);
        }
      } else {
        setLocalTutorialState(tutorial, true);

        updateStoredTutorialState(tutorialState);
      }
    };

    const NextButton = () => {
      const nextPageExists =
        (tutorialStepRef.current == 1 && !!pageTwo) ||
        (tutorialStepRef.current == 2 && !!pageThree);
      return (
        <Pressable
          onPress={nextPageExists && tutorialState ? press : closeTutorial}
          className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
        >
          <Text>{nextPageExists && tutorialState ? "Next" : "Close"}</Text>
        </Pressable>
      );
    };

    const handleSwitchValueChange = (val: boolean) => {
      setTutorialState(val);
    };

    return (
      <GenericModal
        isVisibleCondition={shouldShow}
        backFunction={() => {
          if (backFunction) {
            backFunction();
          }
          if (clearOverride) {
            clearOverride();
          }
          if (gameState) {
            gameState.updateTutorialState(tutorial, true);
          } else {
            setLocalTutorialState(tutorial, true);
          }
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
                onValueChange={handleSwitchValueChange}
                value={tutorialState}
              />
            </View>
            <NextButton />
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
                onValueChange={handleSwitchValueChange}
                value={tutorialState}
              />
            </View>
            <NextButton />
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
                  onValueChange={handleSwitchValueChange}
                  value={tutorialState}
                />
              </View>
              <NextButton />
            </>
          )
        )}
      </GenericModal>
    );
  },
);
export default TutorialModal;
