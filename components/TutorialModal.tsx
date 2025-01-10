import React from "react";
import { useEffect, useRef, useState } from "react";
import { View, Pressable, Switch, AccessibilityRole } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Text } from "./Themed";
import { observer } from "mobx-react-lite";
import { TutorialOption } from "../utility/types";
import GenericModal from "./GenericModal";
import { useVibration } from "../hooks/generic";
import { useRootStore } from "../hooks/stores";
import { text, tw, tw_base, useStyles } from "../hooks/styles";
import Colors from "../constants/Colors";

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
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | "mixed";
    busy?: boolean;
    expanded?: boolean;
  };
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
    ...props
  }: ITutorialModal) => {
    const { tutorialStore, uiStore } = useRootStore();
    const styles = useStyles();
    const vibration = useVibration();
    const theme = Colors[uiStore.colorScheme];

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
          ((tutorialStore.tutorialsEnabled ||
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
        >
          {({ pressed }) => (
            <View
              style={[
                styles.nextButton,
                pressed && {
                  transform: [{ scale: 0.95 }],
                  opacity: 0.5,
                },
              ]}
            >
              <Text>
                {nextPageExists && tutorialState
                  ? "Next"
                  : "Acknowledge Knowledge"}
              </Text>
            </View>
          )}
        </Pressable>
      );
    };

    const renderPage = (page: TutorialPage) => (
      <>
        <View style={[styles.rowBetween, { alignItems: "center" }]}>
          <View style={{ width: tw_base[6] }}>
            {tutorialStep !== 1 ? (
              <Pressable
                onPress={() => {
                  setTutorialStep((prev) => prev - 1);
                  tutorialStepRef.current--;
                }}
              >
                <Entypo
                  name="chevron-left"
                  size={24}
                  color={uiStore.colorScheme === "dark" ? "#f4f4f5" : "black"}
                />
              </Pressable>
            ) : (
              <View></View>
            )}
          </View>
          {page.title && (
            <Text
              style={{
                textAlign: "center",
                flex: 1,
                paddingHorizontal: 10,
                ...styles.titleText,
              }}
            >
              {page.title}
            </Text>
          )}
          <Text style={{ width: tw_base[6] }}>
            {tutorialStep}/{pageThree ? 3 : 2}
          </Text>
        </View>
        <Text style={[tw.mt2, { textAlign: "center" }, styles.bodyText]}>
          {page.body}
        </Text>
        {tutorial !== TutorialOption.firstBossKill && (
          <View
            style={{
              marginHorizontal: "auto",
              flexDirection: "row",
              ...tw.my2,
            }}
          >
            <Text style={[text.xl, { marginVertical: "auto" }]}>
              Tutorials Enabled:{" "}
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: theme.interactive }}
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
        accessibilityRole="alert"
        {...props}
      >
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
