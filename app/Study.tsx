import { View, Text, ScrollView } from "../components/Themed";
import "../assets/styles/globals.css";
import { Pressable, Image } from "react-native";
import { useContext, useEffect, useState } from "react";
import { Item } from "../classes/item";
import { toTitleCase } from "../utility/functions";
import { useIsFocused } from "@react-navigation/native";
import { GameContext, PlayerCharacterContext } from "./_layout";
import ProgressBar from "../components/ProgressBar";
import { elementalColorMap } from "../utility/elementColors";
import { useVibration } from "../utility/customHooks";
import SpellDetails from "../components/SpellDetails";
import PlayerStatus from "../components/PlayerStatus";

export default function LearningSpellsScreen() {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  if (!playerCharacterData || !gameData) {
    throw new Error("missing context");
  }
  const { playerState } = playerCharacterData;
  if (!playerState) throw new Error("no playerState");
  const { gameState } = gameData;

  const books = playerState?.inventory.filter(
    (item) => item.itemClass == "book",
  );
  const isFocused = useIsFocused();

  const vibration = useVibration();

  const [selectedBook, setSelectedBook] = useState<Item | null>(null);
  const [selectedBookSpell, setSelectedBookSpell] = useState<{
    name: string;
    element: string;
    proficiencyNeeded: number;
    manaCost: number;
    effects: {
      damage: number | null;
      buffs: string[] | null;
      debuffs:
        | {
            name: string;
            chance: number;
          }[]
        | null;
      summon?: string[];
      selfDamage?: number;
    };
  } | null>(null);
  const [spellState, setSpellState] = useState<
    {
      bookName: string;
      spellName: string;
      experience: number;
      element: string;
    }[]
  >(playerState.learningSpells);

  useEffect(() => {
    if (selectedBook && playerState) {
      setSelectedBookSpell(
        selectedBook.getAttachedSpell(playerState.playerClass),
      );
    } else setSelectedBookSpell(null);
  }, [selectedBook]);

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
    <View className="flex-1 pb-4">
      <PlayerStatus onTop={true} />
      <View className="px-4">
        {filteredBooks.length == 0 && playerState.learningSpells.length == 0 ? (
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
                <Pressable
                  onPress={() => {
                    studySpell(
                      studyState.bookName,
                      studyState.spellName,
                      studyState.element,
                    );
                    vibration({ style: "light" });
                  }}
                  className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text>Continue Studying</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        {selectedBook && selectedBookSpell ? (
          <View className="flex items-center py-4">
            <Text className="text-xl">{toTitleCase(selectedBook.name)}</Text>
            <Text className="py-2 text-lg tracking-wide">Teaches</Text>
            <SpellDetails spell={selectedBookSpell} />
            <Pressable
              onPress={() => {
                vibration({ style: "light", essential: true });
                studySpell(
                  selectedBook.name,
                  selectedBookSpell.name,
                  selectedBookSpell.element,
                );
                setSelectedBook(null);
              }}
              className="mt-4 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text>Start Studying</Text>
            </Pressable>
          </View>
        ) : null}
        {filteredBooks.length > 0 ? (
          <View className="py-4">
            <Text className="text-center text-xl">Available for Study</Text>
            <ScrollView className="mx-auto">
              <View className="my-auto max-h-64 flex-wrap justify-around">
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
  );
}
