import { Text, ThemedView } from "@/components/Themed";
import { Pressable, View, ScrollView } from "react-native";
import { AccelerationCurves, toTitleCase } from "@/utility/functions/misc";
import ProgressBar from "@/components/ProgressBar";
import SpellDetails from "@/components/SpellDetails";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { Image } from "expo-image";
import {
  Element,
  ElementToString,
  ItemClassType,
  MasteryToString,
} from "@/utility/types";
import GenericModal from "@/components/GenericModal";
import { elementalColorMap } from "@/constants/Colors";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useRootStore } from "@/hooks/stores";
import { useAcceleratedAction, useVibration } from "@/hooks/generic";
import type { Item } from "@/entities/item";
import React from "react";
import { radius, useStyles } from "@/hooks/styles";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { observer } from "mobx-react-lite";
import { useHeaderHeight } from "@react-navigation/elements";
import { Attack } from "@/entities/attack";

interface SpellStudyingState {
  bookName: string;
  spellName: string;
  experience: number;
  element: Element;
}

const StudyButton = React.memo(
  ({
    studyState,
    onStudy,
  }: {
    studyState: SpellStudyingState;
    onStudy: (state: SpellStudyingState) => void;
  }) => {
    const { start: handlePressIn, stop: handlePressOut } = useAcceleratedAction(
      () => null,
      {
        minHoldTime: 350,
        maxSpeed: 2,
        accelerationCurve: AccelerationCurves.none,
        action: () => onStudy(studyState),
        minActionAmount: 1,
        maxActionAmount: 50,
        debounceTime: 100,
      },
    );

    return (
      <GenericRaisedButton
        onPress={() => onStudy(studyState)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        Continue Studying
      </GenericRaisedButton>
    );
  },
);

const LearningSpellScreen = observer(() => {
  const root = useRootStore();
  const { playerState, uiStore } = root;
  const styles = useStyles();

  const isFocused = useIsFocused();
  const vibration = useVibration();

  const [selectedBook, setSelectedBook] = useState<Item | null>(null);
  const [selectedBookSpell, setSelectedBookSpell] = useState<Attack | null>(
    null,
  );
  const [showMasteryLevelTooLow, setShowMasteryLevelTooLow] =
    useState<Element | null>(null);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    if (selectedBook && playerState) {
      const spell = selectedBook.attachedSpell;

      if (spell) {
        setSelectedBookSpell(spell);
      }
    }
  }, [selectedBook, playerState]);

  const filteredBooks = playerState?.baseInventory
    .filter((item) => item.itemClass == ItemClassType.Book)
    ?.filter(
      (book) =>
        !playerState?.learningSpells
          .map((studyState) => studyState.spellName)
          ?.includes(book.attachedSpell?.name!),
    );

  const studySpell = useCallback(
    (bookName: string, spellName: string, spellElement: Element) => {
      if (playerState && isFocused) {
        playerState.learnSpellStep(bookName, spellName, spellElement);
        setSpellState(playerState.learningSpells);
        root.gameTick();
      }
    },
    [playerState, isFocused, root],
  );

  const [spellState, setSpellState] = useState<
    SpellStudyingState[] | undefined
  >(playerState?.learningSpells);

  const bookLabel = useCallback(() => {
    if (
      playerState &&
      selectedBookSpell &&
      selectedBookSpell.proficiencyNeeded !== null
    ) {
      return `${
        MasteryToString[selectedBookSpell.proficiencyNeeded]
      } level book`;
    }
    return "";
  }, [playerState, selectedBookSpell]);

  const NoActionsMessage = useMemo(() => {
    if (
      filteredBooks?.length === 0 &&
      playerState?.learningSpells.length === 0
    ) {
      return (
        <View style={[styles.columnCenter, styles.pt12]}>
          <Text style={styles["text-xl"]}>No Books to Learn From</Text>
          <Text>(Books can be bought from the Librarian)</Text>
        </View>
      );
    }
    return null;
  }, [filteredBooks?.length, playerState?.learningSpells.length, styles]);

  const continueStudying = useCallback(
    (studyState: SpellStudyingState) => {
      studySpell(studyState.bookName, studyState.spellName, studyState.element);
      vibration({ style: "light" });
    },
    [studySpell, vibration],
  );

  const CurrentlyStudyingSection = useMemo(() => {
    if (spellState && spellState.length > 0)
      return (
        <View style={styles.py4}>
          <Text style={[styles.textCenter, styles["text-xl"]]}>
            Currently Studying
          </Text>
          {spellState.map((studyState) => (
            <View key={`${studyState.bookName}-${studyState.spellName}`}>
              <Text>{toTitleCase(studyState.spellName)}</Text>
              <ProgressBar
                filledColor={elementalColorMap[studyState.element].dark}
                unfilledColor={elementalColorMap[studyState.element].light}
                value={studyState.experience}
                maxValue={20}
              />
              <StudyButton studyState={studyState} onStudy={continueStudying} />
            </View>
          ))}
        </View>
      );
    return null;
  }, [spellState, styles, continueStudying]);

  const SelectedBookSection = useMemo(() => {
    if (selectedBook && selectedBookSpell)
      return (
        <ThemedView
          style={[styles.columnCenter, styles.py4, styles.themedCard]}
        >
          <Text style={styles["text-xl"]}>
            {toTitleCase(selectedBook.name)}
          </Text>
          <Text style={[styles.py2, styles["text-lg"], { letterSpacing: 0.1 }]}>
            Teaches
          </Text>
          <Text style={[styles.py2, styles["text-lg"], { letterSpacing: 0.1 }]}>
            {/*TODO*/}({bookLabel()})
          </Text>
          <SpellDetails spell={selectedBookSpell} />
          <GenericRaisedButton
            onPress={() => {
              if (
                playerState &&
                selectedBookSpell.proficiencyNeeded !== null &&
                selectedBookSpell.element &&
                selectedBookSpell.proficiencyNeeded <=
                  playerState.currentMasteryLevel(selectedBookSpell.element)
              ) {
                vibration({ style: "light", essential: true });
                studySpell(
                  selectedBook.name,
                  selectedBookSpell.name,
                  selectedBookSpell.element,
                );
                setSelectedBook(null);
              } else {
                setShowMasteryLevelTooLow(selectedBookSpell.element);
              }
            }}
          >
            Start Studying
          </GenericRaisedButton>
        </ThemedView>
      );
    return null;
  }, [
    selectedBook,
    selectedBookSpell,
    styles,
    bookLabel,
    playerState,
    vibration,
    studySpell,
  ]);

  const NonStartedBooksSection = useMemo(() => {
    if (filteredBooks && filteredBooks.length > 0) {
      return (
        <View style={styles.py4}>
          <Text style={[styles.textCenter, styles["text-xl"]]}>
            Available for Study
          </Text>
          <ScrollView
            horizontal
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flexWrap: "wrap",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {filteredBooks.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    radius.lg,
                    styles.columnCenter,
                    { backgroundColor: "#a1a1aa", marginHorizontal: 4 },
                    selectedBook?.id === item.id && {
                      borderWidth: 2,
                      borderColor: "red",
                    },
                  ]}
                  onPress={() => setSelectedBook(item)}
                >
                  <View
                    style={[
                      styles.inventoryItemContainer,
                      {
                        height: uiStore.itemBlockSize,
                        width: uiStore.itemBlockSize,
                      },
                    ]}
                  >
                    <Image
                      source={item.getItemIcon()}
                      style={{
                        width: uiStore.itemBlockSize * 0.65,
                        height: uiStore.itemBlockSize * 0.65,
                      }}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      );
    }
    return null;
  }, [filteredBooks, styles, radius.lg, selectedBook?.id]);

  return (
    <>
      <GenericModal
        isVisibleCondition={showMasteryLevelTooLow != null}
        backFunction={() => setShowMasteryLevelTooLow(null)}
      >
        {showMasteryLevelTooLow && (
          <>
            <Text
              style={[
                styles.textCenter,
                {
                  color: elementalColorMap[showMasteryLevelTooLow].dark,
                },
              ]}
            >
              {`This book is beyond your knowledge in the school of ${ElementToString[showMasteryLevelTooLow]}`}
            </Text>
            <GenericRaisedButton
              onPress={() => setShowMasteryLevelTooLow(null)}
              textColor={elementalColorMap[showMasteryLevelTooLow].dark}
            >
              Acknowledge Knowledge
            </GenericRaisedButton>
          </>
        )}
      </GenericModal>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: headerHeight,
            paddingBottom: uiStore.playerStatusHeightSecondary,
            paddingHorizontal: 12,
          }}
        >
          {NoActionsMessage}
          {NonStartedBooksSection}
          {SelectedBookSection}
          {CurrentlyStudyingSection}
        </ScrollView>
      </View>
      <PlayerStatusForSecondary />
    </>
  );
});

export default LearningSpellScreen;
