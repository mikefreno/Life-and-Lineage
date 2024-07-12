import { View, Text, ScrollView } from "../components/Themed";
import "../assets/styles/globals.css";
import {
  Pressable,
  Image,
  View as NonThemedView,
  Platform,
  StyleSheet,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { Item } from "../classes/item";
import { toTitleCase } from "../utility/functions/misc/words";
import { useIsFocused } from "@react-navigation/native";
import { GameContext, PlayerCharacterContext } from "./_layout";
import ProgressBar from "../components/ProgressBar";
import { elementalColorMap } from "../utility/elementColors";
import { useVibration } from "../utility/customHooks";
import SpellDetails from "../components/SpellDetails";
import PlayerStatus from "../components/PlayerStatus";
import { useColorScheme } from "nativewind";
import { Stack } from "expo-router";
import { BlurView } from "expo-blur";
import { useHeaderHeight } from "@react-navigation/elements";
import GenericRaisedButton from "../components/GenericRaisedButton";
import { MasteryLevel, Spell } from "../utility/types";
import GenericModal from "../components/GenericModal";
import {
  convertMasteryToNumber,
  convertMasteryToString,
  getMasteryLevel,
} from "../utility/spellHelper";

export default function LearningKnowledgeScreen() {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  if (!playerCharacterData || !gameData) {
    throw new Error("missing context");
  }
  const { playerState } = playerCharacterData;
  if (!playerState) throw new Error("no playerState");
  const { gameState } = gameData;
  const { colorScheme } = useColorScheme();

  const books = playerState?.inventory.filter(
    (item) => item.itemClass == "book",
  );
  const isFocused = useIsFocused();

  const vibration = useVibration();

  const [selectedBook, setSelectedBook] = useState<Item | null>(null);
  const [selectedBookSpell, setSelectedBookSpell] = useState<Spell | null>(
    null,
  );
  const [spellState, setSpellState] = useState<
    {
      bookName: string;
      spellName: string;
      experience: number;
      element: string;
    }[]
  >(playerState.learningSpells);
  const [showMasteryLevelTooLow, setShowMasteryLevelTooLow] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (selectedBook && playerState) {
      setSelectedBookSpell(
        selectedBook.getAttachedSpell(playerState.playerClass),
      );
    } else setSelectedBookSpell(null);
  }, [selectedBook]);

  useEffect(() => {
    console.log(selectedBookSpell);
  }, [selectedBookSpell]);

  function studySpell(
    bookName: string,
    spellName: string,
    spellElement: string,
  ) {
    if (playerState && gameState && isFocused) {
      playerState.learnSpellStep(bookName, spellName, spellElement);
      setSpellState(playerState.learningSpells);
      gameState.gameTick(playerState);
    }
  }

  const studyingSpells = playerState.learningSpells.map(
    (studyState) => studyState.spellName,
  );

  const filteredBooks = books?.filter(
    (book) =>
      !studyingSpells?.includes(
        book.getAttachedSpell(playerState.playerClass).name,
      ),
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Magic Study",
          headerBackTitleVisible: false,
          headerTransparent: true,
          headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          headerBackground: () => (
            <BlurView
              blurReductionFactor={12}
              tint={
                Platform.OS == "android"
                  ? colorScheme == "light"
                    ? "light"
                    : "dark"
                  : "default"
              }
              intensity={100}
              style={StyleSheet.absoluteFill}
              experimentalBlurMethod={"dimezisBlurView"}
            />
          ),
        }}
      />
      <GenericModal
        isVisibleCondition={showMasteryLevelTooLow != null}
        backFunction={() => setShowMasteryLevelTooLow(null)}
      >
        {showMasteryLevelTooLow != null ? (
          <>
            <Text
              className="text-center"
              style={{
                color:
                  elementalColorMap[
                    showMasteryLevelTooLow as
                      | "fire"
                      | "water"
                      | "air"
                      | "earth"
                      | "blood"
                      | "summoning"
                      | "pestilence"
                      | "bone"
                      | "holy"
                      | "vengeance"
                      | "protection"
                  ].dark,
              }}
            >
              This book is beyond your knowledge in the school of{" "}
              {showMasteryLevelTooLow}
            </Text>
            <GenericRaisedButton
              onPressFunction={() => setShowMasteryLevelTooLow(null)}
              textColor={
                elementalColorMap[
                  showMasteryLevelTooLow as
                    | "fire"
                    | "water"
                    | "air"
                    | "earth"
                    | "blood"
                    | "summoning"
                    | "pestilence"
                    | "bone"
                    | "holy"
                    | "vengeance"
                    | "protection"
                ].dark
              }
              text={"Acknowledge Knowledge"}
            />
          </>
        ) : null}
      </GenericModal>
      <View className="flex-1">
        <View
          style={{
            paddingBottom: 95,
            paddingTop: useHeaderHeight(),
            paddingHorizontal: 12,
          }}
        >
          {filteredBooks.length == 0 &&
          playerState.learningSpells.length == 0 ? (
            <View className="items-center pt-12">
              <Text className="text-xl italic">No Books to Learn From</Text>
              <Text className="italic">
                (Books can be bought from the Librarian)
              </Text>
            </View>
          ) : null}
          {spellState.length > 0 ? (
            <View className="pb-12 pt-4">
              <Text className="text-center text-xl">Currently Studying</Text>
              {spellState.map((studyState) => (
                <View key={studyState.spellName}>
                  <Text>{toTitleCase(studyState.spellName)}</Text>
                  <ProgressBar
                    filledColor={
                      elementalColorMap[
                        studyState.element as
                          | "fire"
                          | "water"
                          | "air"
                          | "earth"
                          | "blood"
                          | "summoning"
                          | "pestilence"
                          | "bone"
                          | "holy"
                          | "vengeance"
                          | "protection"
                      ].dark
                    }
                    unfilledColor={
                      elementalColorMap[
                        studyState.element as
                          | "fire"
                          | "water"
                          | "air"
                          | "earth"
                          | "blood"
                          | "summoning"
                          | "pestilence"
                          | "bone"
                          | "holy"
                          | "vengeance"
                          | "protection"
                      ].light
                    }
                    value={studyState.experience}
                    maxValue={20}
                  />
                  <GenericRaisedButton
                    onPressFunction={() => {
                      studySpell(
                        studyState.bookName,
                        studyState.spellName,
                        studyState.element,
                      );
                      vibration({ style: "light" });
                    }}
                    text={"Continue\nStudying"}
                  />
                </View>
              ))}
            </View>
          ) : null}
          {selectedBook && selectedBookSpell ? (
            <View className="flex items-center py-4">
              <Text className="text-xl">{toTitleCase(selectedBook.name)}</Text>
              <Text className="py-2 text-lg tracking-wide">Teaches</Text>
              <Text className="py-2 text-lg tracking-wide">
                ({convertMasteryToString[selectedBookSpell.proficiencyNeeded]})
              </Text>
              <SpellDetails spell={selectedBookSpell} />
              <GenericRaisedButton
                onPressFunction={() => {
                  if (
                    (playerState.currentMasteryLevel(
                      selectedBookSpell.element,
                    ) as MasteryLevel) >=
                    convertMasteryToNumber[selectedBookSpell.proficiencyNeeded]
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
                text={"Start Studying"}
              />
            </View>
          ) : null}
          {filteredBooks.length > 0 ? (
            <View className="py-4">
              <Text className="text-center text-xl">Available for Study</Text>
              <ScrollView className="mx-auto" horizontal>
                <View className="my-auto max-h-24 flex-wrap">
                  {filteredBooks.map((item) => (
                    <Pressable
                      key={item.id}
                      className="m-2 items-center active:scale-90 active:opacity-50"
                      onPress={() => setSelectedBook(item)}
                    >
                      <View
                        className="rounded-lg p-2"
                        style={{ backgroundColor: "#a1a1aa" }}
                      >
                        <Image source={item.getItemIcon()} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </View>
      <NonThemedView className="absolute z-50 w-full" style={{ bottom: 95 }}>
        <PlayerStatus />
      </NonThemedView>
    </>
  );
}
