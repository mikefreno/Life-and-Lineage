import { View, Text, ScrollView } from "../components/Themed";
import "../assets/styles/globals.css";
import { useDispatch, useSelector } from "react-redux";
import { selectGame, selectPlayerCharacter } from "../redux/selectors";
import ProgressBar from "../components/ProgressBar";
import { Pressable, Image } from "react-native";
import { useEffect, useState } from "react";
import { Item } from "../classes/item";
import blessingDisplay from "../components/BlessingsDisplay";
import { fullSave, toTitleCase } from "../utility/functions";
import { setGameData, setPlayerCharacter } from "../redux/slice/game";
import { elementalColorMap } from "../utility/elementColors";
import { useColorScheme } from "nativewind";

export default function LearningSpellsScreen() {
  const playerCharacter = useSelector(selectPlayerCharacter);
  const game = useSelector(selectGame);
  if (!playerCharacter || !game)
    throw new Error("No playerCharacter or game in LearningSpellsScreen");
  const inventory = playerCharacter.getInventory();
  const books = inventory.filter((item) => item.itemClass == "book");
  const dispatch = useDispatch();

  const { colorScheme } = useColorScheme();

  const studyingState = playerCharacter.learningSpells;
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

  useEffect(() => {
    if (selectedBook) {
      setSelectedBookSpell(
        selectedBook.getAttachedSpell(playerCharacter.playerClass),
      );
    } else setSelectedBookSpell(null);
  }, [selectedBook]);

  function studySpell(
    bookName: string,
    spellName: string,
    spellElement: string,
  ) {
    if (playerCharacter && game) {
      playerCharacter.learnSpellStep(bookName, spellName, spellElement);
      game.gameTick();
      dispatch(setPlayerCharacter(playerCharacter));
      dispatch(setGameData(game));
      fullSave(game, playerCharacter);
    }
  }

  const studyingSpells = studyingState.map(
    (studyState) => studyState.spellName,
  );

  const filteredBooks = books.filter(
    (book) =>
      !studyingSpells.includes(
        book.getAttachedSpell(playerCharacter.playerClass).name,
      ),
  );

  return (
    <View className="flex-1 px-4 py-6">
      {studyingState.length > 0 ? (
        <View className="pb-12 pt-4">
          <Text className="text-center text-xl">Currently Studying</Text>
          {studyingState.map((studyState) => (
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
                      | "summons"
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
                      | "summons"
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
                onPress={() =>
                  studySpell(
                    studyState.bookName,
                    studyState.spellName,
                    studyState.element,
                  )
                }
                className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Continue Studying</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      {selectedBook && selectedBookSpell ? (
        <View className="flex items-center pb-4">
          <Text className="text-lg">{toTitleCase(selectedBook.name)}</Text>
          <View className="flex flex-row">
            <Text className="my-auto text-xl">School: </Text>
            <View className="items-center py-2">
              {blessingDisplay(selectedBookSpell.element, colorScheme, 50)}
              <Text>{toTitleCase(selectedBookSpell.element)}</Text>
            </View>
          </View>
          <Text className="text-2xl tracking-wide">
            Teaches {toTitleCase(selectedBookSpell.name)}
          </Text>
          <Pressable
            onPress={() => {
              studySpell(
                selectedBook.name,
                selectedBookSpell.name,
                selectedBookSpell.element,
              );
              setSelectedBook(null);
            }}
            className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text>Start Studying</Text>
          </Pressable>
        </View>
      ) : null}
      {filteredBooks.length > 0 ? (
        <View>
          <Text className="text-center text-xl">Available to Learn</Text>
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
      {filteredBooks.length == 0 && studyingState.length == 0 ? (
        <View className="-mt-24 flex-1 items-center justify-center">
          <Text className="text-xl italic">No Books to Learn From</Text>
        </View>
      ) : null}
    </View>
  );
}
