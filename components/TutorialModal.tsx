import { useEffect, useRef, useState } from "react";
import { View, Pressable, Switch } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Text } from "./Themed";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import { TutorialOption } from "../utility/types";
import GenericModal from "./GenericModal";
import { useVibration } from "../hooks/generic";
import { useRootStore } from "../hooks/stores";

type TutorialPage = {
  title?: string;
  body: string;
};

type ITutorialModal = {
  isFocused: boolean;
  tutorial: TutorialOption;
  backFunction?: () => void;
  onCloseFunction?: () => void;
  pageOne: TutorialPage;
  pageTwo?: TutorialPage;
  pageThree?: TutorialPage;
  override?: boolean;
  clearOverride?: () => void;
};

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
    const { tutorialStore } = useRootStore();
    const { colorScheme } = useColorScheme();
    const vibration = useVibration();

    const [tutorialStep, setTutorialStep] = useState(1);
    const tutorialStepRef = useRef(1);
    const [tutorialState, setTutorialState] = useState(
      tutorialStore.tutorialsEnabled,
    );
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
      setTutorialState(tutorialStore.tutorialsEnabled);
      setShouldShow(
        override ||
          ((!tutorialStore.tutorialsEnabled ||
            tutorial === TutorialOption.firstBossKill) &&
            !tutorialStore.tutorialsShown[tutorial]),
      );
    }, [
      tutorialStore.tutorialsEnabled,
      tutorialStore.tutorialsShown[tutorial],
      override,
      isFocused,
    ]);

    const handlePress = () => {
      if (
        tutorialStepRef.current < 3 &&
        (tutorialStepRef.current === 1 ? pageTwo : pageThree)
      ) {
        setTutorialStep((prev) => prev + 1);
        tutorialStepRef.current++;
      } else {
        closeTutorial();
      }
    };

    const closeTutorial = () => {
      vibration({ style: "light" });
      onCloseFunction?.();
      clearOverride?.();
      tutorialStore.updateTutorialState(tutorial, true);
      tutorialState
        ? tutorialStore.enableTutorials()
        : tutorialStore.disableTutorials();

      setShouldShow(false);
    };

    const NextButton = () => {
      const nextPageExists =
        (tutorialStepRef.current === 1 && pageTwo) ||
        (tutorialStepRef.current === 2 && pageThree);
      return (
        <Pressable
          onPress={
            nextPageExists && tutorialState ? handlePress : closeTutorial
          }
          className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
        >
          <Text>
            {nextPageExists && tutorialState ? "Next" : "Acknowledge Knowledge"}
          </Text>
        </Pressable>
      );
    };

    const renderPage = (page: TutorialPage) => (
      <>
        {page.title && (
          <Text className="text-center text-2xl md:text-3xl">{page.title}</Text>
        )}
        <Text className="mt-2 text-center text-lg md:text-xl">{page.body}</Text>
        {tutorial !== TutorialOption.firstBossKill && (
          <View className="mx-auto my-[2vh] flex flex-row">
            <Text className="my-auto text-lg">Tutorials Enabled: </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#3b82f6" }}
              ios_backgroundColor="#3e3e3e"
              thumbColor="white"
              onValueChange={setTutorialState}
              value={tutorialState}
            />
          </View>
        )}
        <NextButton />
      </>
    );

    return (
      <GenericModal
        isVisibleCondition={shouldShow}
        backFunction={() => {
          backFunction?.();
          clearOverride?.();
          tutorialStore.updateTutorialState(tutorial, true);

          setShouldShow(false);
        }}
      >
        {pageTwo && (
          <View
            className={`flex flex-row ${
              tutorialStep !== 1 ? "justify-between" : "justify-end"
            }`}
          >
            {tutorialStep !== 1 && (
              <Pressable
                onPress={() => {
                  setTutorialStep((prev) => prev - 1);
                  tutorialStepRef.current--;
                }}
              >
                <Entypo
                  name="chevron-left"
                  size={24}
                  color={colorScheme === "dark" ? "#f4f4f5" : "black"}
                />
              </Pressable>
            )}
            <Text>
              {tutorialStep}/{pageThree ? 3 : 2}
            </Text>
          </View>
        )}
        {renderPage(
          tutorialStep === 1
            ? pageOne
            : tutorialStep === 2
            ? pageTwo!
            : pageThree!,
        )}
      </GenericModal>
    );
  },
);

export default TutorialModal;
