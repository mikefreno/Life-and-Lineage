import { Text, View, ScrollView } from "../components/Themed";
import { calculateAge } from "../utility/functions/misc";
import { CharacterImage } from "../components/CharacterImage";
import { useContext } from "react";
import { GameContext, PlayerCharacterContext } from "./_layout";
import { useHeaderHeight } from "@react-navigation/elements";
import GenericStrikeAround from "../components/GenericStrikeAround";
import { Character } from "../classes/character";
import ProgressBar from "../components/ProgressBar";
import AffectionIcon from "../assets/icons/AffectionIcon";

export default function RelationshipsScreen() {
  const playerCharacterContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  if (!playerCharacterContext || !gameContext) {
    throw new Error("missing context");
  }
  const { playerState } = playerCharacterContext;
  const { gameState } = gameContext;

  const acquaintances = playerState?.knownCharacters.filter(
    (character) => character.affection < 25 && character.affection > -25,
  );
  const friends = playerState?.knownCharacters.filter(
    (character) => character.affection >= 25 && character.affection < 75,
  );
  const bestFriend = playerState?.knownCharacters.filter(
    (character) => character.affection >= 75,
  );
  const enemies = playerState?.knownCharacters.filter(
    (character) => character.affection <= -25 && character.affection > -75,
  );
  const bitterEnemies = playerState?.knownCharacters.filter(
    (character) => character.affection <= -75,
  );

  function renderCharacter(character: Character) {
    if (gameState) {
      const characterAge = calculateAge(
        new Date(character.birthdate),
        character.deathdate
          ? new Date(character.deathdate)
          : new Date(gameState.date),
      );

      return (
        <View className="flex w-1/2 items-center" key={character.id}>
          <Text className="text-center text-2xl">
            {character.getFullName()}
          </Text>
          <View className="mx-auto">
            <CharacterImage
              characterAge={characterAge}
              characterSex={character.sex == "male" ? "M" : "F"}
            />
          </View>
          <Text className="text-xl">
            {character.deathdate && "Died at "}
            {characterAge} Years Old
          </Text>
          <Text className="text-xl">{character.getFullName()}</Text>
          <View className="mx-auto">
            <Text className="flex flex-wrap text-center text-lg">
              {character.deathdate && "Was a "}
              {character.job}
            </Text>
          </View>
          <View className="flex w-2/3 flex-row justify-center">
            <View className="w-3/4">
              <ProgressBar
                value={Math.floor(character.affection * 4) / 4}
                minValue={-100}
                maxValue={100}
                filledColor="#dc2626"
                unfilledColor="#fca5a5"
              />
            </View>
            <View className="my-auto ml-1">
              <AffectionIcon height={14} width={14} />
            </View>
          </View>
        </View>
      );
    }
  }

  if (playerState) {
    return (
      <ScrollView>
        <View
          className="flex-1 items-center px-8"
          style={{ paddingTop: useHeaderHeight() }}
        >
          {playerState.children.length > 0 && (
            <>
              <Text className="py-12 text-center text-2xl">Children</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {playerState.children.map((child) => renderCharacter(child))}
              </View>
            </>
          )}
          {playerState.partners.length > 0 && (
            <>
              <Text className="py-12 text-center text-2xl">
                {playerState.partners.length == 1 ? "Partner" : "Partners"}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {playerState.partners.map((child) => renderCharacter(child))}
              </View>
            </>
          )}
          <>
            <Text className="py-12 text-center text-2xl">Parents</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}
            >
              {playerState.parents.map((parent) => renderCharacter(parent))}
            </View>
          </>
          {bestFriend && bestFriend.length > 0 && (
            <>
              <Text className="py-4 text-center text-2xl">Best Friends</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {bestFriend.map((bestFriend) => renderCharacter(bestFriend))}
              </View>
            </>
          )}
          {bitterEnemies && bitterEnemies.length > 0 && (
            <>
              <Text className="py-4 text-center text-2xl">Bitter Enemies</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {bitterEnemies.map((bitterEnemy) =>
                  renderCharacter(bitterEnemy),
                )}
              </View>
            </>
          )}
          {friends && friends.length > 0 && (
            <>
              <Text className="py-4 text-center text-2xl">Friends</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {friends.map((friend) => renderCharacter(friend))}
              </View>
            </>
          )}
          {enemies && enemies.length > 0 && (
            <>
              <Text className="py-4 text-center text-2xl">Enemies</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {enemies.map((enemy) => renderCharacter(enemy))}
              </View>
            </>
          )}
          {acquaintances && acquaintances.length > 0 && (
            <>
              <Text className="py-4 text-center text-2xl">Acquaintances</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {acquaintances.map((acquaintance) =>
                  renderCharacter(acquaintance),
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    );
  }
}
