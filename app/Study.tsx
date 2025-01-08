import { Text } from "../components/Themed";
import { Pressable, Image, View, ScrollView } from "react-native";
import { AccelerationCurves, toTitleCase } from "../utility/functions/misc";
import ProgressBar from "../components/ProgressBar";
import SpellDetails from "../components/SpellDetails";
import PlayerStatus from "../components/PlayerStatus";
import GenericRaisedButton from "../components/GenericRaisedButton";
import {
  Element,
  ElementToString,
  ItemClassType,
  MasteryToString,
} from "../utility/types";
import GenericModal from "../components/GenericModal";
import { elementalColorMap } from "../constants/Colors";
import { useCallback, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRootStore } from "../hooks/stores";
import { useAcceleratedAction, useVibration } from "../hooks/generic";
import type { Item } from "../entities/item";
import type { Spell } from "../entities/spell";
import React from "react";
import { radius, text, useStyles } from "../hooks/styles";

const StudyButton = ({ studyState, onStudy }) => {
  const { start: handlePressIn, stop: handlePressOut } = useAcceleratedAction(
    () => null,
    {
      minHoldTime: 350,
      maxSpeed: 10,
      accelerationCurve: AccelerationCurves.linear,
      action: () => onStudy(studyState),
      minActionAmount: 1,
      maxActionAmount: 50,
      debounceTime: 50,
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
};

export default function LearningKnowledgeScreen() {
  const root = useRootStore();
  const { playerState, uiStore } = root;
  const styles = useStyles();

  const books = playerState?.baseInventory.filter(
    (item) => item.itemClass == ItemClassType.Book,
  );
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();

  const vibration = useVibration();

  const [selectedBook, setSelectedBook] = useState<Item | null>(null);
  const [selectedBookSpell, setSelectedBookSpell] = useState<Spell | null>(
    null,
  );
  const [spellState, setSpellState] = useState<
    | {
        bookName: string;
        spellName: string;
        experience: number;
        element: Element;
      }[]
    | undefined
  >(playerState?.learningSpells);
  const [showMasteryLevelTooLow, setShowMasteryLevelTooLow] =
    useState<Element | null>(null);

  useEffect(() => {
    if (selectedBook && playerState) {
      const spell = selectedBook.attachedSpell;

      if (spell) {
        setSelectedBookSpell(spell);
      }
    }
  }, [selectedBook]);

  function studySpell(
    bookName: string,
    spellName: string,
    spellElement: Element,
  ) {
    if (playerState && isFocused) {
      playerState.learnSpellStep(bookName, spellName, spellElement);
      setSpellState(playerState.learningSpells);
      root.gameTick();
    }
  }

  const studyingSpells = playerState?.learningSpells.map(
    (studyState) => studyState.spellName,
  );

  const filteredBooks = books?.filter(
    (book) => !studyingSpells?.includes(book.attachedSpell?.name!),
  );
  function bookLabel() {
    if (playerState && selectedBookSpell) {
      return `${
        MasteryToString[selectedBookSpell.proficiencyNeeded]
      } level book`;
    }
  }

  const continueStudying = useCallback(
    (studyState) => {
      studySpell(studyState.bookName, studyState.spellName, studyState.element);
      vibration({ style: "light" });
    },
    [studySpell],
  );

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
      <View
        style={[
          { flex: 1, justifyContent: "space-between", paddingBottom: 20 },
        ]}
      >
        <View
          style={{
            paddingTop: headerHeight,
            paddingHorizontal: 12,
          }}
        >
          {filteredBooks?.length == 0 &&
          playerState?.learningSpells.length == 0 ? (
            <View style={[styles.columnCenter, styles.pt12]}>
              <Text style={text.xl}>No Books to Learn From</Text>
              <Text>(Books can be bought from the Librarian)</Text>
            </View>
          ) : null}
          {spellState && spellState.length > 0 && (
            <ScrollView style={{ maxHeight: uiStore.dimensions.height * 0.25 }}>
              <View style={[styles.py4]}>
                <Text style={[styles.textCenter, styles.xl]}>
                  Currently Studying
                </Text>
                {spellState.map((studyState) => (
                  <View key={studyState.spellName}>
                    <Text>{toTitleCase(studyState.spellName)}</Text>
                    <ProgressBar
                      filledColor={elementalColorMap[studyState.element].dark}
                      unfilledColor={
                        elementalColorMap[studyState.element].light
                      }
                      value={studyState.experience}
                      maxValue={20}
                    />
                    <StudyButton
                      studyState={studyState}
                      onStudy={continueStudying}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
          {selectedBook && selectedBookSpell && (
            <View style={[styles.columnCenter, styles.py4]}>
              <Text style={styles.xl}>{toTitleCase(selectedBook.name)}</Text>
              <Text style={[styles.py2, styles.lg, { letterSpacing: 0.1 }]}>
                Teaches
              </Text>
              <Text style={[styles.py2, styles.lg, { letterSpacing: 0.1 }]}>
                ({bookLabel()})
              </Text>
              <SpellDetails spell={selectedBookSpell} />
              <GenericRaisedButton
                onPress={() => {
                  if (
                    playerState &&
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
            </View>
          )}
          {filteredBooks && filteredBooks.length > 0 && (
            <View style={styles.py4}>
              <Text style={[styles.textCenter, styles.xl]}>
                Available for Study
              </Text>
              <ScrollView horizontal>
                <View style={[styles.my2, { maxHeight: 96, flexWrap: "wrap" }]}>
                  {filteredBooks.map((item) => (
                    <Pressable
                      key={item.id}
                      style={[styles.m2, styles.columnCenter]}
                      onPress={() => setSelectedBook(item)}
                    >
                      <View
                        style={[
                          styles.p2,
                          radius.lg,
                          { backgroundColor: "#a1a1aa" },
                        ]}
                      >
                        <Image source={item.getItemIcon()} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </View>
      <PlayerStatus tabScreen />
    </>
  );
}
